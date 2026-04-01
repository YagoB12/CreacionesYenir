using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Products;
using backend_yenir.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace RegisterProduct.Tests
{
    [TestClass]
    public class RegisterProductTests
    {
        private ApplicationDbContext _context;
        private ProductsController _controller;

        [TestInitialize]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);

            var env = new FakeWebHostEnvironment();
            var imageService = new ImageService(env);

            _controller = new ProductsController(_context, imageService);
        }

        [TestMethod]
        public async Task CreateProduct_ReturnsOk_WhenDataIsValid()
        {
            // Arrange
            var dto = new CreateProductDTO
            {
                Name = "Producto Test",
                Description = "Descripción test",
                Category = 0, // Ropa
                Color = "Negro",
                Price = 10000,
                Stock = 5,
                TypeMaterial = "Algodón",
                Size = "M",
                TypeClothes = "Camisa",
                TypeGender = "Unisex",
                Image = CreateFakeImage()
            };

            // Act
            var result = await _controller.CreateProduct(dto);

            // Assert Comprueba que el resultado sea un ok, osea se guarda.
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
        }

        private IFormFile CreateFakeImage()
        {
            var content = "fake image content";
            var bytes = Encoding.UTF8.GetBytes(content);
            var stream = new MemoryStream(bytes);

            return new FormFile(stream, 0, bytes.Length, "image", "test.png")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/png"
            };
        }
    }
}
