using backend_yenir.Data;
using backend_yenir.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    [ApiController]
    [Route("api/payment")]
    [Authorize] // Por defecto requiere token
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly EmailTemplateService _emailTemplateService;
        private readonly IConfiguration _configuration;
        private readonly BillPdfService _billPdfService;

        // Constructor
        public PaymentController(
            ApplicationDbContext context,
            EmailService emailService,
            IConfiguration configuration,
            BillPdfService billPdfService,
            EmailTemplateService emailTemplateService
        )
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _billPdfService = billPdfService;
            _emailTemplateService = emailTemplateService;
        }

        // GET: api/payments
        // Lista todos los pagos (solo admin)
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetPayments()
        {
            var payments = await _context
                .Payments.AsNoTracking()
                .Include(p => p.User)
                .Include(p => p.Bill)
                .Include(p => p.OrderDetails)
                    .ThenInclude(od => od.Product)
                .OrderByDescending(p => p.DateCreate)
                .Select(p => new
                {
                    p.Id,
                    p.DateCreate,
                    p.status,
                    p.TotalPrice,
                    p.Img,

                    User = new
                    {
                        p.UserId,
                        p.User.Name,
                        p.User.LastName,
                        p.User.Email,
                    },

                    Bill = p.Bill == null
                        ? null
                        : new
                        {
                            p.Bill.Id,
                            p.Bill.NumBill,
                            p.Bill.DateEmission,
                            p.Bill.Status,
                            p.Bill.TotalAmount,
                        },

                    Details = p.OrderDetails.Select(od => new
                    {
                        od.Id,
                        od.ProductId,
                        ProductName = od.Product.Name,
                        od.Quantity,
                        od.UnitePrice,
                        od.TotalPrice,
                    }),
                })
                .ToListAsync();

            return Ok(
                new
                {
                    message = "Pagos obtenidos correctamente",
                    count = payments.Count,
                    data = payments,
                }
            );
        }

        // Enpoint para que acepte o no, el estado de pago y factura(Back)
        // PUT: api/payment/verify/5?status=2
        [HttpPut("verify/{paymentId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> VerifyPayment(int paymentId, [FromQuery] int status)
        {
            const int PENDING = 1;
            const int APPROVED = 2;
            const int REJECTED = 3;

            if (status != APPROVED && status != REJECTED)
                return BadRequest("Estado inválido. Use 2 (Pago confirmado) o 3 (Pago cancelado)");

            var payment = await _context
                .Payments.Include(p => p.Bill)
                .Include(p => p.User)
                .Include(p => p.Order)
                .Include(p => p.OrderDetails)
                    .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(p => p.Id == paymentId);

            if (payment == null)
                return NotFound("Pago no encontrado.");

            if (payment.status != PENDING)
                return BadRequest("Este pago ya fue verificado.");

            if (payment.Bill == null)
                return BadRequest("Este pago no tiene factura asociada.");

            // 1) Actualizar estados (pago, factura, pedido)
            payment.status = status;
            payment.Bill.Status = status;
            payment.Order.Status = status;

            await _context.SaveChangesAsync();

            // 2) Preparar correo
            string estadoTexto = status == APPROVED ? "Pago confirmado" : "Pago cancelado";

            string mensajePrincipal =
                status == APPROVED
                    ? "Tu compra fue aceptada satisfactoriamente."
                    : "El comprobante de pago no fue válido. Por favor comunícate con el administrador.";

            string adminContact =
                _configuration["Smtp:AdminContact"]
                ?? _configuration["Smtp:User"]
                ?? "admin@empresa.com";

            string billNumber = payment.Bill.NumBill;
            DateTime billDate = payment.Bill.DateEmission;
            decimal total = payment.Bill.TotalAmount;

            string subject = $"Estado de tu factura {billNumber}: {estadoTexto}";

            string estadoColor = status == APPROVED ? "#16a34a" : "#dc2626";
            string estadoFondo = status == APPROVED ? "#dcfce7" : "#fee2e2";

            string body = _emailTemplateService.BuildPaymentStatusTemplate(
                $"{payment.User.Name} {payment.User.LastName}",
                billNumber,
                estadoTexto,
                estadoColor,
                estadoFondo,
                total,
                billDate,
                mensajePrincipal,
                adminContact
            );

            // 3) Generar PDF
            var pdfBytes = _billPdfService.GenerateBillPdf(
                payment.Bill,
                payment,
                payment.OrderDetails,
                adminContact,
                estadoTexto
            );

            // 4) Enviar correo con PDF adjunto
            var (ok, emailMsg) = await _emailService.SendAsync(
                payment.User.Email,
                subject,
                body,
                attachment: (pdfBytes, $"Factura-{billNumber}.pdf", "application/pdf")
            );

            return Ok(
                new
                {
                    message = ok
                        ? (
                            status == APPROVED
                                ? "Pago aprobado, factura actualizada y correo enviado al cliente con PDF adjunto."
                                : "Pago cancelado, factura actualizada y correo enviado al cliente con PDF adjunto."
                        )
                        : (
                            status == APPROVED
                                ? "Pago aprobado y factura actualizada, pero falló el envío del correo."
                                : "Pago cancelado y factura actualizada, pero falló el envío del correo."
                        ),
                    emailSent = ok,
                    emailError = ok ? null : emailMsg,
                    paymentId = payment.Id,
                    billId = payment.Bill.Id,
                    newStatus = status,
                }
            );
        }
    }
}
