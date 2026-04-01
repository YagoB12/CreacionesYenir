using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Claims;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Payments;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.AspNetCore.Hosting;

namespace Tests
{
    [TestClass]
    public class CreateOrderTest
    {
        [TestMethod]
        public async Task CreateBill_CreatesOrderAutomatically()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase($"db_{Guid.NewGuid()}")
                .Options;

            await using var context = new ApplicationDbContext(options);

            var user = new User
            {
                Id = 1,
                Name = "Ana",
                LastName = "Test",
                BirthDay = new DateTime(1990, 1, 1),
                Email = "ana@test.com",
                PasswordHash = "hash",
                Role = UserRole.CLIENT,
                PhoneNumber = "88888888",
                Gender = "F",
            };

            var product = new Product
            {
                Id = 1,
                Name = "Producto 1",
                Category = ProductCategory.Clothing,
                Price = 10,
                Stock = 5,
                CreatedAt = DateTime.UtcNow,
            };

            context.Users.Add(user);
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var imageService = new ImageService(new FakeWebHostEnvironment());
            var controller = new BillController(context, imageService)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = BuildUserPrincipal(user.Id),
                    },
                },
            };

            var dto = new PaymentDTO
            {
                orderPayment = new List<OrderPaymentDTO>
                {
                    new OrderPaymentDTO
                    {
                        ProductId = product.Id,
                        Quantity = 1,
                    },
                },
            };

            var result = await controller.CreateBill(dto);

            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok);

            var order = await context.Orders.Include(o => o.Payment).FirstOrDefaultAsync();
            Assert.IsNotNull(order);
            Assert.IsNotNull(order.Payment);
            Assert.AreEqual(user.Id, order.Payment.UserId);
            Assert.AreEqual(1, order.Status);
        }

        private static ClaimsPrincipal BuildUserPrincipal(int userId)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, "CLIENT"),
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            return new ClaimsPrincipal(identity);
        }

        private sealed class FakeWebHostEnvironment : IWebHostEnvironment
        {
            public string ApplicationName { get; set; } = "TestApp";
            public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
            public string WebRootPath { get; set; } = ".";
            public string EnvironmentName { get; set; } = "Development";
            public string ContentRootPath { get; set; } = ".";
            public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        }
    }
}
