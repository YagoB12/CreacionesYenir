using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Products;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Threading.Tasks;

namespace UpdateProduct.Tests
{
    [TestClass]
    public class UpdateProductTests
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

            // ImageService NO se usa en Update → pasamos null
            _controller = new ProductsController(_context, null!);
        }

        // =========================
        // UPDATE ROPA
        // =========================
        [TestMethod]
        public async Task UpdateProduct_ReturnsOk_WhenClothingDataIsValid()
        {
            // Arrange (producto existente)
            var product = new Product
            {
                Name = "Camisa vieja",
                Category = ProductCategory.Clothing,
                Size = "M",
                TypeClothes = "Camisa",
                TypeGender = "Unisex",
                Price = 8000,
                Stock = 10
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var dto = new UpdateProductDTO
            {
                Name = "Camisa nueva",
                Price = 10000,
                Stock = 5
            };

            // Act
            var result = await _controller.UpdateProduct(product.Id, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
            Assert.AreEqual("Producto actualizado correctamente",
                ((OkObjectResult)result).Value);
        }

        // =========================
        // UPDATE ACCESORIO
        // =========================
        [TestMethod]
        public async Task UpdateProduct_ReturnsOk_WhenAccessoryDataIsValid()
        {
            // Arrange
            var product = new Product
            {
                Name = "Mesa",
                Category = ProductCategory.HomeAccessories,
                Height = 50,
                Length = 100,
                Width = 60,
                Price = 30000,
                Stock = 2
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var dto = new UpdateProductDTO
            {
                Price = 35000,
                Stock = 3
            };

            // Act
            var result = await _controller.UpdateProduct(product.Id, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));
        }
    }
}
