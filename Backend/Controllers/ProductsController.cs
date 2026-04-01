using backend_yenir.Data;
using backend_yenir.DTOs.Products;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    [ApiController]
    [Route("api/products")]
    [Authorize] // Por defecto requiere token
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ImageService _imageService;

        // Constructor
        public ProductsController(ApplicationDbContext context, ImageService imageService)
        {
            _context = context;
            _imageService = imageService;
        }

        // =========================
        // GET ALL (PÚBLICO)
        // =========================
        //Este endpoint es público, no requiere autenticación y sirve para obtener todos los productos disponibles.
        [HttpGet]
        [AllowAnonymous] // Permitir acceso sin token
        public async Task<IActionResult> GetAll() // Endpoint público para obtener todos los productos
        {
            var products = await _context
                .Products //
                .Select(p => new // Seleccionar solo los campos necesarios
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    Category = p.Category.ToString(),
                    p.Color,
                    p.Price,
                    p.Stock,
                    p.Img,
                    p.TypeMaterial,
                    p.Size,
                    p.TypeClothes,
                    p.TypeGender,
                    p.Height,
                    p.Length,
                    p.Width,
                    p.CreatedAt,
                })
                .ToListAsync(); // Ejecutar consulta y obtener lista de productos

            return Ok(
                new // Devolver respuesta con mensaje, conteo y datos
                {
                    message = "Productos obtenidos correctamente",
                    count = products.Count,
                    data = products,
                }
            );
        }

        // =========================
        // GET BY ID (PÚBLICO)
        // =========================
        [HttpGet("{id}")]
        [AllowAnonymous] // Permitir acceso sin token y este endpoint ees para obtener un producto por su ID
        public async Task<IActionResult> GetById(int id) // Endpoint público para obtener un producto por ID
        {
            var product = await _context
                .Products.Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    Category = p.Category.ToString(),
                    p.Color,
                    p.Price,
                    p.Stock,
                    p.Img,
                    p.TypeMaterial,
                    p.Size,
                    p.TypeClothes,
                    p.TypeGender,
                    p.Height,
                    p.Length,
                    p.Width,
                    p.CreatedAt,
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound("Producto no encontrado");

            return Ok(product);
        }

        // =========================
        // CREATE (ADMIN)
        // =========================
        //Este endpoint es para que los administradores puedan crear nuevos productos.
        [HttpPost("create")] // Endpoint protegido para crear un nuevo producto
        [Authorize(Roles = "ADMIN")] // Solo accesible por administradores
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductDTO dto) // Recibir datos del producto desde un formulario
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Category != 0 && dto.Category != 1)
                return BadRequest("Categoría inválida. Use 0 para Ropa o 1 para Accesorios");

            if (dto.Price <= 0)
                return BadRequest("El precio debe ser mayor a 0");

            if (dto.Stock < 0)
                return BadRequest("El stock no puede ser negativo");

            if (
                dto.Category == 0
                && (dto.Size == null || dto.TypeClothes == null || dto.TypeGender == null)
            )
                return BadRequest("La prenda debe tener talla, tipo y género");

            if (
                dto.Category == 1
                && (dto.Height == null || dto.Length == null || dto.Width == null)
            )
                return BadRequest("El accesorio debe tener largo, alto y ancho");

            var (success, message, imagePath) = await _imageService.SaveImageAsync(dto.Image);
            if (!success)
                return BadRequest(message);

            try
            {
                var product = new Product
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    Category = (ProductCategory)dto.Category,
                    Color = dto.Color,
                    Price = dto.Price,
                    Stock = dto.Stock,
                    Img = imagePath,
                    TypeMaterial = dto.TypeMaterial,
                    Size = dto.Size,
                    TypeClothes = dto.TypeClothes,
                    TypeGender = dto.TypeGender,
                    Height = dto.Height,
                    Length = dto.Length,
                    Width = dto.Width,
                    CreatedAt = DateTime.UtcNow,
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return Ok(
                    new { message = "Producto creado correctamente", productId = product.Id }
                );
            }
            catch
            {
                _imageService.DeleteImage(imagePath);
                throw;
            }
        }

        // =========================
        // UPDATE (ADMIN)
        // =========================
        [HttpPut("update/{id}")] // Endpoint protegido para actualizar un producto existente
        [Authorize(Roles = "ADMIN")] // Solo accesible por administradores
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductDTO dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Producto no encontrado");

            var category = dto.Category.HasValue
                ? (ProductCategory)dto.Category.Value
                : product.Category;

            if (category == ProductCategory.Clothing)
            {
                if (
                    (dto.Size ?? product.Size) == null
                    || (dto.TypeClothes ?? product.TypeClothes) == null
                    || (dto.TypeGender ?? product.TypeGender) == null
                )
                    return BadRequest("La prenda debe tener talla, tipo y género");
            }

            if (category == ProductCategory.HomeAccessories)
            {
                if (
                    (dto.Height ?? product.Height) == null
                    || (dto.Length ?? product.Length) == null
                    || (dto.Width ?? product.Width) == null
                )
                    return BadRequest("El accesorio debe tener largo, alto y ancho");
            }

            if (dto.Name != null)
                product.Name = dto.Name;
            if (dto.Description != null)
                product.Description = dto.Description;
            if (dto.Category.HasValue)
                product.Category = category;
            if (dto.Color != null)
                product.Color = dto.Color;
            if (dto.Price.HasValue)
                product.Price = dto.Price.Value;
            if (dto.Stock.HasValue)
                product.Stock = dto.Stock.Value;
            if (dto.TypeMaterial != null)
                product.TypeMaterial = dto.TypeMaterial;

            if (dto.Size != null)
                product.Size = dto.Size;
            if (dto.TypeClothes != null)
                product.TypeClothes = dto.TypeClothes;
            if (dto.TypeGender != null)
                product.TypeGender = dto.TypeGender;

            if (dto.Height.HasValue)
                product.Height = dto.Height.Value;
            if (dto.Length.HasValue)
                product.Length = dto.Length.Value;
            if (dto.Width.HasValue)
                product.Width = dto.Width.Value;

            //  Actualizar imagen si viene una nueva
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var oldImg = product.Img;

                var (success, message, imagePath) = await _imageService.SaveImageAsync(dto.Image);
                if (!success)
                    return BadRequest(message);

                product.Img = imagePath;

                // borrar la anterior si existía
                if (!string.IsNullOrEmpty(oldImg))
                    _imageService.DeleteImage(oldImg);
            }

            await _context.SaveChangesAsync();

            return Ok("Producto actualizado correctamente");
        }

        // =========================
        // DELETE (ADMIN)
        // =========================
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "ADMIN")] // Solo accesible por administradores
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Producto no encontrado");

            if (!string.IsNullOrEmpty(product.Img))
                _imageService.DeleteImage(product.Img);

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok("Producto eliminado correctamente");
        }
    }
}
