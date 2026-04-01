using System.Security.Claims;
using backend_yenir.Data;
using backend_yenir.DTOs.Payments;
using backend_yenir.DTOs.Products;
using backend_yenir.Models;
using backend_yenir.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    [ApiController]
    [Route("api/bills")]
    [Authorize] // Por defecto requiere token
    public class BillController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ImageService _imageService;

        // Constructor
        public BillController(ApplicationDbContext context, ImageService imageService)
        {
            _context = context;
            _imageService = imageService;
        }

        [HttpPost("create")]
        [Authorize(Roles = "CLIENT")]
        public async Task<IActionResult> CreateBill([FromForm] PaymentDTO dto)
        {
            if (dto == null || dto.orderPayment == null || !dto.orderPayment.Any())
                return BadRequest("Debe enviar al menos un producto.");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("Token inválido");

            int userId = int.Parse(userIdClaim);

            decimal totalGeneral = 0;
            var orderDetails = new List<OrderDetail>();

            foreach (var item in dto.orderPayment)
            {
                var product = await _context.Products.FindAsync(item.ProductId);

                if (product == null)
                    return NotFound($"Producto con ID {item.ProductId} no existe.");

                if (product.Stock < item.Quantity)
                    return BadRequest($"Stock insuficiente para el producto {product.Name}");

                decimal total = product.Price * item.Quantity;

                orderDetails.Add(
                    new OrderDetail
                    {
                        ProductId = product.Id,
                        Quantity = item.Quantity,
                        UnitePrice = product.Price,
                        TotalPrice = total,
                    }
                );

                totalGeneral += total;
                product.Stock -= item.Quantity;
            }

            // GUARDAR IMAGEN PRIMERO
            string? imagePath = null;

            if (dto.Img != null)
            {
                var (success, message, savedPath) = await _imageService.SaveImageAsync(dto.Img);

                if (!success)
                    return BadRequest(message);

                imagePath = savedPath;
            }

            // Crear Payment
            var payment = new Payment
            {
                DateCreate = DateTime.UtcNow,
                status = 1,
                TotalPrice = totalGeneral,
                Img = imagePath,
                UserId = userId,
                OrderDetails = orderDetails,
            };

            _context.Payments.Add(payment); //       Guarda directamente
            await _context.SaveChangesAsync();

            // NUEVO PEDIDO (ORDER)
            //Después de guardar el Payment, ahora:....Eso crea el pedido ligado al pago.
            payment.Order = new Order { DateEmission = DateTime.UtcNow, Status = 1 };
            await _context.SaveChangesAsync(); //Guarda cambios editados del modelo

            string numBill = $"FAC-{DateTime.UtcNow:yyyyMMdd}-{payment.Id}";

            var user = await _context.Users.FindAsync(userId);

            var bill = new Bill
            {
                NumBill = numBill,
                NameClient = user!.Name + " " + user.LastName,
                AddressClient =
                    (user.Province + " " + user.Canton + " " + user.District) ?? "Sin dirección",
                DateEmission = DateTime.UtcNow,
                TotalAmount = totalGeneral,
                Status = 1,
                ClientId = userId,
                PaymentId = payment.Id,
            };

            _context.Bills.Add(bill);
            await _context.SaveChangesAsync();

            //Limpiar el carrito
            var cartItems = await _context
                .ShoppingCarts.Where(c => c.UserId == userId)
                .ToListAsync();

            _context.ShoppingCarts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return Ok(
                new
                {
                    message = "Factura creada correctamente",
                    billId = bill.Id,
                    paymentId = payment.Id,
                    total = totalGeneral,
                }
            );
        }

        // GET: Endpoint: Listar facturas en verificación por parte del Administrador
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetBills()
        {
            var bills = await _context
                .Bills.Include(b => b.Payment) // Incluir relación
                .OrderByDescending(b => b.DateEmission)
                .Select(b => new
                {
                    b.Id,
                    b.NumBill,
                    b.NameClient,
                    b.AddressClient,
                    b.DateEmission,
                    b.TotalAmount,
                    b.Status,

                    Payment = new
                    {
                        b.Payment.Id,
                        b.Payment.DateCreate,
                        b.Payment.status,
                        b.Payment.TotalPrice,
                        b.Payment.Img,
                        b.Payment.UserId,
                    },
                })
                .ToListAsync();

            if (!bills.Any())
            {
                return Ok(
                    new
                    {
                        message = "No hay facturas registradas.",
                        count = 0,
                        data = bills,
                    }
                );
            }

            return Ok(
                new
                {
                    message = "Facturas obtenidas correctamente",
                    count = bills.Count,
                    data = bills,
                }
            );
        }

        // PUT: api/bills/verify/5
        [HttpPut("verify/{billId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> VerifyPayment(int billId, [FromQuery] int status)
        {
            const int PENDING = 1;
            const int APPROVED = 2;
            const int REJECTED = 3;

            if (status != APPROVED && status != REJECTED)
                return BadRequest("Estado inválido. Use 2 (Aprobado) o 3 (Rechazado)");

            var bill = await _context
                .Bills.Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == billId);

            if (bill == null)
                return NotFound("Factura no encontrada.");

            if (bill.Status != PENDING)
                return BadRequest("Esta factura ya fue procesada.");

            // Actualizar estados
            bill.Status = status;
            bill.Payment.status = status;

            await _context.SaveChangesAsync();

            string message =
                status == APPROVED
                    ? "Pago aprobado correctamente."
                    : "Pago rechazado correctamente.";

            return Ok(
                new
                {
                    message,
                    billId = bill.Id,
                    paymentId = bill.Payment.Id,
                    newStatus = status,
                }
            );
        }

        // GET: api/bills/my/status
        [HttpGet("my/status")]
        [Authorize(Roles = "CLIENT")]
        public async Task<IActionResult> GetMyBillStatus()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("Token inválido");

            int userId = int.Parse(userIdClaim);

            var bills = await _context
                .Bills.AsNoTracking()
                .Include(b => b.Payment)
                .Where(b => b.ClientId == userId)
                .OrderByDescending(b => b.DateEmission)
                .Select(b => new
                {
                    b.Id,
                    b.NumBill,
                    b.DateEmission,
                    b.TotalAmount,
                    BillStatus = b.Status,
                    PaymentStatus = b.Payment.status,
                })
                .ToListAsync();

            if (!bills.Any())
                return Ok(
                    new
                    {
                        message = "No tienes facturas registradas.",
                        count = 0,
                        data = bills,
                    }
                );

            return Ok(
                new
                {
                    message = "Estados de facturas obtenidos correctamente",
                    count = bills.Count,
                    data = bills,
                }
            );
        }
    }
}
