using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ListPayment.Tests
{
    [TestClass]
    public class ListPaymentTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [TestMethod]
        public async Task GetPayments_ShouldReturnPayments_ForAdmin()
        {
            // Arrange
            var context = GetDbContext();

            const int APPROVED = 2;

            var user = new User
            {
                Name = "Yorleni",
                LastName = "Aguilar",
                Email = "yor@gmail.com",
                Gender = "Femenino",
                PasswordHash = "123456Test",
                PhoneNumber = "88888888"
            };

            var product = new Product
            {
                Name = "Laptop",
                Price = 1000
            };

            context.Users.Add(user);
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var payment = new Payment
            {
                UserId = user.Id,
                DateCreate = DateTime.UtcNow,
                status = APPROVED,
                TotalPrice = 1000,
                Img = "comprobante.jpg",
                OrderDetails = new List<OrderDetail>
                {
                    new OrderDetail
                    {
                        ProductId = product.Id,
                        Quantity = 1,
                        UnitePrice = 1000,
                        TotalPrice = 1000
                    }
                }
            };

            context.Payments.Add(payment);
            await context.SaveChangesAsync();

            var controller = new PaymentController(context);

            // Simular usuario ADMIN
            var adminUser = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Role, "ADMIN")
            }, "mock"));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = adminUser }
            };

            // Act
            var result = await controller.GetPayments();

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var response = okResult.Value;

            var countProperty = response.GetType().GetProperty("count");
            var dataProperty = response.GetType().GetProperty("data");

            var count = (int)countProperty.GetValue(response);

            Assert.AreEqual(1, count);

            var payments = ((System.Collections.IEnumerable)dataProperty.GetValue(response))
                .Cast<object>()
                .ToList();

            Assert.AreEqual(1, payments.Count);
        }
    }
}