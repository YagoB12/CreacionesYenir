using System.Security.Claims;
using backend_yenir.Data;
using backend_yenir.DTOs.Reviews;
using backend_yenir.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    [Authorize] // jwttt
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =========================
        // endpoint: Crear una reseña
        // =========================
        [HttpPost("create")]
        public async Task<IActionResult> CreateReview(CreateReviewDTO dto)
        {
            // Validaciones por DataAnnotations
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Obtener userId desde el token JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("Token inválido");

            int userId = int.Parse(userIdClaim);

            // Verificar que el producto exista
            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);

            if (!productExists)
                return BadRequest("El producto no existe");

            // Crear la reseña
            var review = new Review
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Comment = dto.Comment,
                Calification = dto.Calification,
                DateCreate = DateTime.UtcNow,
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reseña creada correctamente", reviewId = review.Id });
        }

        //endpoint: Obtener las reseñas por producto
        //la idea de este endpoint es que se usee por parte del cliente
        [HttpGet("product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var reviews = await _context
                .Reviews.Where(r => r.ProductId == productId)
                .Include(r => r.User)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    UserName = r.User!.Name,
                    r.Comment,
                    r.Calification,
                    r.DateCreate,
                })
                .ToListAsync();

            if (!reviews.Any())
                return NotFound("Este producto no tiene reseñas");

            return Ok(
                new
                {
                    message = "Reseñas del producto obtenidas correctamente",
                    count = reviews.Count,
                    data = reviews,
                }
            );
        }

        //GET /api/reviews - Obtener todas las reseñas (admin)
        //este endpoint es para que el admin pueda ver todas las reseñas, no se va a usar por parte del cliente
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _context
                .Reviews.Include(r => r.User)
                .Include(r => r.Product)
                .Select(r => new
                {
                    r.Id,
                    r.ProductId,
                    ProductName = r.Product!.Name,
                    r.UserId,
                    UserName = r.User!.Name,
                    r.Comment,
                    r.Calification,
                    r.DateCreate,
                })
                .ToListAsync();

            return Ok(
                new
                {
                    message = "Reseñas obtenidas correctamente",
                    count = reviews.Count,
                    data = reviews,
                }
            );
        }

        //endpoint: Obtener el promedio de calificaciones por producto
        //la idea de este endpoint es que se usee por parte del cliente
        [HttpGet("product/{productId}/average")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAverageByProduct(int productId)
        {
            var reviews = await _context.Reviews.Where(r => r.ProductId == productId).ToListAsync();

            if (!reviews.Any())
                return NotFound("Este producto no tiene reseñas");

            var average = reviews.Average(r => r.Calification);

            return Ok(
                new
                {
                    productId = productId,
                    averageCalification = average,
                    totalReviews = reviews.Count,
                }
            );
        }

        //endpoint: Actualizar una reseña (solo el usuario que la creó puede actualizarla)
        //La idea de este endpoint es que se usee por parte del cliente
        [HttpPut("update/{reviewId}")]
        [Authorize]
        public async Task<IActionResult> UpdateReview(int reviewId, UpdateReviewDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Obtener el UserId desde el JWT
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Buscar la reseña
            var review = await _context.Reviews.FindAsync(reviewId);

            if (review == null)
                return NotFound("Reseña no encontrada");

            // Verificar que la reseña pertenece al usuario en sesión
            if (review.UserId != userId)
                return Forbid("No puedes modificar una reseña que no es tuya");

            // Actualizar campos
            if (dto.Comment != null)
                review.Comment = dto.Comment;

            if (dto.Calification.HasValue)
                review.Calification = dto.Calification.Value;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Reseña actualizada correctamente", reviewId = review.Id });
        }

        //endpoint: Eliminar una reseña (solo el usuario que la creó puede eliminarla)
        //La idea de este endpoint es que se usee por parte del cliente
        [HttpDelete("delete/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(int id)
        {
            // Obtener el userId desde el JWT
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
                return NotFound("Reseña no encontrada");

            // Verificar que la reseña sea del usuario en sesión
            if (review.UserId != userId)
                return Forbid("No puedes eliminar una reseña que no es tuya");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reseña eliminada correctamente", reviewId = id });
        }

        //endpoint: Eliminar una reseña (solo el admin puede eliminar cualquier reseña)
        //La idea de este endpoint es que se usee por parte del admin
        [HttpDelete("admin/delete/{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteReviewByAdmin(int id)
        {
            var review = await _context
                .Reviews.Include(r => r.User)
                .Include(r => r.Product)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
                return NotFound("Reseña no encontrada");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(
                new
                {
                    message = "Reseña eliminada por administrador",
                    reviewId = review.Id,
                    productId = review.ProductId,
                    userId = review.UserId,
                }
            );
        }
    }
}
