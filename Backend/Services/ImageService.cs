using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace backend_yenir.Services
{
    public class ImageService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private const string UPLOAD_FOLDER = "images/products";
        private const long MAX_FILE_SIZE = 5 * 1024 * 1024; 
        private static readonly string[] ALLOWED_EXTENSIONS = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        public ImageService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }
        public async Task<(bool success, string message, string? imagePath)> SaveImageAsync(IFormFile image)
        {
            if (image == null || image.Length == 0)
                return (false, "No se proporcionó imagen", null);

            if (image.Length > MAX_FILE_SIZE)
                return (false, $"La imagen no puede exceder {MAX_FILE_SIZE / (1024 * 1024)} MB", null);

            var extension = Path.GetExtension(image.FileName).ToLower();
            if (!ALLOWED_EXTENSIONS.Contains(extension))
                return (false, $"Extensión no permitida. Usa: {string.Join(", ", ALLOWED_EXTENSIONS)}", null);

            try
            {
                var uploadPath = Path.Combine(_webHostEnvironment.WebRootPath, UPLOAD_FOLDER);
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                var relativePath = $"{UPLOAD_FOLDER}/{fileName}";
                return (true, "Imagen guardada correctamente", relativePath);
            }
            catch (Exception ex)
            {
                return (false, $"Error al guardar imagen: {ex.Message}", null);
            }
        }

        public bool DeleteImage(string? imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
                return true;

            try
            {
                var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, imagePath);
                if (File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
