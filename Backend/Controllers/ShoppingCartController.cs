using System.Security.Claims;
using backend_yenir.Data;
using backend_yenir.DTOs.ShoppingCart;
using backend_yenir.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    [Route("api/shoppingcart")]
    [ApiController]
    [Authorize]
    public class ShoppingCartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ShoppingCartController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================
        // GET: api/shoppingcart
        // ============================
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Usuario no identificado");

            var userId = int.Parse(userIdClaim);

            var cart = await _context
                .ShoppingCarts.Include(sc => sc.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                cart = new ShoppingCart { UserId = userId, Total = 0 };
                _context.ShoppingCarts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var result = new ShoppingCartDTO
            {
                Id = cart.Id,
                UserId = cart.UserId,
                Total = cart.Total,
                Items = cart
                    .Items.Select(i => new ShoppingCartItemDTO
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.Product?.Name ?? string.Empty,
                        ProductImage = i.Product?.Img,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        Subtotal = i.SubTotal,
                    })
                    .ToList(),
            };

            return Ok(result);
        }

        // ============================
        // POST: api/shoppingcart/add
        // ============================
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Quantity <= 0)
                return BadRequest("La cantidad debe ser mayor a 0");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Usuario no identificado");

            var userId = int.Parse(userIdClaim);

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return NotFound("Producto no encontrado");

            var cart = await _context
                .ShoppingCarts.Include(sc => sc.Items)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                cart = new ShoppingCart { UserId = userId, Total = 0 };
                _context.ShoppingCarts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);

            if (existingItem != null)
            {
                var nuevaCantidad = existingItem.Quantity + dto.Quantity;

                // VALIDACION
                if (nuevaCantidad > product.Stock)
                    return BadRequest("No hay suficientes unidades disponibles");

                existingItem.Quantity = nuevaCantidad;
                existingItem.SubTotal = existingItem.Quantity * existingItem.UnitPrice;
            }
            else
            {
                // Validar stock si es la primera vez que se agrega
                if (dto.Quantity > product.Stock)
                    return BadRequest("Stock insuficiente");

                var item = new ShoppingCartItem
                {
                    ShoppingCartId = cart.Id,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    UnitPrice = product.Price,
                    SubTotal = dto.Quantity * product.Price,
                };
                _context.ShoppingCartItems.Add(item);
            }

            cart.Total = cart.Items.Sum(i => i.SubTotal);

            await _context.SaveChangesAsync();

            return Ok("Producto agregado al carrito");
        }

        // ============================
        // POST: api/shoppingcart/editquantity
        // ============================
        [HttpPost("editquantity")]
        public async Task<IActionResult> EditQuantity([FromBody] EditQuantityProductDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Quantity <= 0)
                return BadRequest("La cantidad debe ser mayor a 0");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("No se pudo indentificar el usuario");

            var userId = int.Parse(userIdClaim);

            var cart = await _context
                .ShoppingCarts.Include(sc => sc.Items)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
                return BadRequest("No se puede modificar un carrito que no existe");

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
            if (existingItem == null)
                return BadRequest("Debe existir el producto en el carrito");

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null)
                return BadRequest("El producto a modificar no existe");

            if (dto.Quantity > product.Stock)
                return BadRequest("La cantidad a modificar no puede ser mayor al Stock disponible");

            existingItem.Quantity = dto.Quantity;
            existingItem.SubTotal = existingItem.UnitPrice * existingItem.Quantity;
            cart.Total = cart.Items.Sum(i => i.SubTotal);
            await _context.SaveChangesAsync();
            return Ok("Se ha actualizado correctamente la cantidad del producto");
        }

        // ============================
        // POST: api/shoppingcart/delete
        // ============================
        [HttpDelete("delete/{productId}")]
        public async Task<IActionResult> DeleteToCart(int productId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("No se pudo indentificar el usuario");

            var userId = int.Parse(userIdClaim);

            var cart = await _context
                .ShoppingCarts.Include(sc => sc.Items)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
                return BadRequest("No se puede eliminar un producto de un carrito que no existe");

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (existingItem == null)
                return BadRequest("Debe existir el producto en el carrito");

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
                return BadRequest("El producto a eliminar no existe");

            cart.Total -= existingItem.SubTotal;
            _context.ShoppingCartItems.Remove(existingItem);
            await _context.SaveChangesAsync();
            return Ok("Se ha eliminado correctamente el producto del carrito de compras");
        }
    }
}
