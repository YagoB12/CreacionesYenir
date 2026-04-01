using Xunit;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Test_de_Anthony_a_Diego.Controllers
{
    public class ProductsControllerTests
    {
        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetAll_ReturnsProducts()
        {
            // Arrange
            var context = GetDb();
            context.Products.Add(new Product
            {
                Name = "Producto Test",
                Price = 1000,
                Stock = 10,
                Category = ProductCategory.Clothing
            });
            await context.SaveChangesAsync();

            var controller = new ProductsController(context, null!);

            // Act
            var result = await controller.GetAll();

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task GetById_ReturnsProduct_WhenExists()
        {
            var context = GetDb();
            context.Products.Add(new Product
            {
                Id = 1,
                Name = "Producto Uno",
                Price = 500,
                Stock = 5,
                Category = ProductCategory.Clothing
            });
            await context.SaveChangesAsync();

            var controller = new ProductsController(context, null!);

            var result = await controller.GetById(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteProduct_RemovesProduct()
        {
            var context = GetDb();
            context.Products.Add(new Product
            {
                Id = 1,
                Name = "Eliminar",
                Price = 200,
                Stock = 1,
                Category = ProductCategory.Clothing
            });
            await context.SaveChangesAsync();

            var controller = new ProductsController(context, null!);

            var result = await controller.DeleteProduct(1);

            Assert.IsType<OkObjectResult>(result);
            Assert.Empty(context.Products);
        }
    }
}
