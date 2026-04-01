using backend_yenir.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend_yenir.Controllers
{
    /// <summary>
    /// Controlador para servir imágenes desde el servidor.
    ///
    /// Las imágenes se guardan en:
    /// - wwwroot/images/products/ - Imágenes de productos
    /// - wwwroot/images/users/ - Avatares de usuarios
    ///
    /// Endpoints:
    /// - GET /api/images/{imagePath} - Descargar/ver imagen
    /// - DELETE /api/images/{imagePath} - Eliminar imagen
    /// </summary>
    [Route("api/images")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly ImageService _imageService;

        public ImagesController(ImageService imageService)
        {
            _imageService = imageService;
        }

        /// <summary>
        /// Obtiene una imagen del servidor.
        ///
        /// GET /api/images/images/products/archivo.jpg
        ///
        /// No requiere autenticación.
        /// Soporta: JPG, PNG, GIF, WEBP
        /// </summary>
        [HttpGet("{*imagePath}")]
        public IActionResult GetImage(string imagePath)
        {
            try
            {
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", imagePath);

                if (!System.IO.File.Exists(fullPath))
                    return NotFound("Imagen no encontrada");

                var extension = Path.GetExtension(fullPath).ToLower();
                var contentType = extension switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".webp" => "image/webp",
                    _ => "application/octet-stream",
                };

                var stream = System.IO.File.OpenRead(fullPath);
                return File(stream, contentType);
            }
            catch
            {
                return StatusCode(500, "Error al obtener imagen");
            }
        }

        /// <summary>
        /// Elimina una imagen del servidor.
        ///
        /// DELETE /api/images/images/products/archivo.jpg
        /// </summary>
        [HttpDelete("{*imagePath}")]
        public IActionResult DeleteImage(string imagePath)
        {
            var result = _imageService.DeleteImage(imagePath);
            if (!result)
                return StatusCode(500, "Error al eliminar imagen");

            return Ok(new { message = "Imagen eliminada correctamente" });
        }
    }
}
