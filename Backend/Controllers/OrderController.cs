using System.Security.Claims;
using backend_yenir.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/orders")]
[ApiController]
public class OrderController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OrderController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/orders/list
    [HttpGet("list")]
    [Authorize(Roles = "CLIENT")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return Unauthorized("Token inválido");

        int userId = int.Parse(userIdClaim);

        var orders = await _context
            .Orders.AsNoTracking()
            .Include(o => o.Payment)
                .ThenInclude(p => p.OrderDetails)
                    .ThenInclude(od => od.Product)
            .Where(o => o.Payment != null && o.Payment.UserId == userId)
            .OrderByDescending(o => o.DateEmission)
            .Select(o => new
            {
                orderId = o.Id,
                dateEmission = o.DateEmission,
                status = o.Status,

                payment = new
                {
                    paymentId = o.Payment!.Id,
                    total = o.Payment.TotalPrice,
                    paymentStatus = o.Payment.status,
                    img = o.Payment.Img,
                    dateCreate = o.Payment.DateCreate,

                    details = o.Payment.OrderDetails.Select(d => new
                    {
                        productId = d.ProductId,
                        productName = d.Product != null ? d.Product.Name : null,
                        quantity = d.Quantity,
                        unitPrice = d.UnitePrice,
                        totalPrice = d.TotalPrice,
                    }),
                },
            })
            .ToListAsync();

        return Ok(orders);
    }

    // DELETE: api/orders/delete/5
    [HttpDelete("delete/{id}")]
    [Authorize(Roles = "CLIENT")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return Unauthorized("Token inválido");

        int userId = int.Parse(userIdClaim);

        var order = await _context
            .Orders.Include(o => o.Payment)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound("Orden no encontrada.");

        // Validar que la orden pertenezca al usuario
        if (order.Payment == null || order.Payment.UserId != userId)
            return Forbid("No tiene permiso para eliminar esta orden.");

        // Validación: Solo eliminar si está comprobado
        // Supongamos que 2 = Comprobado
        if (order.Status != 2)
            return BadRequest("No se puede eliminar el pedido porque no está comprobado.");

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        return Ok("Orden eliminada correctamente.");
    }
}
