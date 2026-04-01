using System.IO;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Products;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Tests
{
    [TestClass]
    public class UpdateProductImageTest
    {
        [TestMethod]
        public async Task UpdateProduct_UpdatesImageAndDeletesOldImage()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var context = new ApplicationDbContext(options);

            var webRootPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            var imagesFolder = Path.Combine(webRootPath, "images", "products");
            Directory.CreateDirectory(imagesFolder);

            var oldImageRelative = "images/products/old.jpg";
            var oldImagePath = Path.Combine(imagesFolder, "old.jpg");
            await File.WriteAllBytesAsync(oldImagePath, new byte[] { 1, 2, 3 });

            var product = new Product
            {
                Id = 1,
                Name = "Producto 1",
                Category = ProductCategory.HomeAccessories,
                Price = 10,
                Stock = 5,
                Height = 1,
                Length = 1,
                Width = 1,
                Img = oldImageRelative,
                CreatedAt = DateTime.UtcNow,
            };

            context.Products.Add(product);
            await context.SaveChangesAsync();

            var imageService = new ImageService(new TestWebHostEnvironment(webRootPath));
            var controller = new ProductsController(context, imageService);

            var dto = new UpdateProductDTO
            {
                Image = CreateFormFile("test.jpg", new byte[] { 10, 20, 30, 40 }),
            };

            var result = await controller.UpdateProduct(product.Id, dto);

            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var updated = await context.Products.AsNoTracking().FirstAsync();

            Assert.IsNotNull(updated.Img);
            Assert.AreNotEqual(oldImageRelative, updated.Img);

            var newImagePath = Path.Combine(
                webRootPath,
                updated.Img.Replace("/", Path.DirectorySeparatorChar.ToString())
            );

            Assert.IsTrue(File.Exists(newImagePath));
            Assert.IsFalse(File.Exists(oldImagePath));
        }

        private static IFormFile CreateFormFile(string fileName, byte[] content)
        {
            var stream = new MemoryStream(content);
            return new FormFile(stream, 0, stream.Length, "Image", fileName);
        }

        private sealed class TestWebHostEnvironment : IWebHostEnvironment
        {
            public TestWebHostEnvironment(string webRootPath)
            {
                WebRootPath = webRootPath;
            }

            public string ApplicationName { get; set; } = "TestApp";
            public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
            public string WebRootPath { get; set; }
            public string EnvironmentName { get; set; } = "Development";
            public string ContentRootPath { get; set; } = ".";
            public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        }
    }
}