using System.Collections;
using System.Security.Claims;
using backend_yenir.Data;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.InMemory;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Tests
{
    [TestClass]
    public class ListOrdersTest
    {
        [TestMethod]
        public async Task GetMyOrders_ReturnsOrdersForUser()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
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

            var otherUser = new User
            {
                Id = 2,
                Name = "Luis",
                LastName = "Test",
                BirthDay = new DateTime(1990, 1, 1),
                Email = "luis@test.com",
                PasswordHash = "hash",
                Role = UserRole.CLIENT,
                PhoneNumber = "77777777",
                Gender = "M",
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

            var payment1 = new Payment
            {
                Id = 1,
                UserId = user.Id,
                User = user,
                status = 2,
                TotalPrice = 10,
                DateCreate = DateTime.UtcNow,
            };

            var detail1 = new OrderDetail
            {
                Id = 1,
                PaymentId = payment1.Id,
                Payment = payment1,
                ProductId = product.Id,
                Product = product,
                Quantity = 1,
                UnitePrice = 10,
                TotalPrice = 10,
            };

            payment1.OrderDetails.Add(detail1);

            var order1 = new Order
            {
                Id = 1,
                PaymentId = payment1.Id,
                Payment = payment1,
                DateEmission = DateTime.UtcNow,
                Status = 2,
            };

            payment1.Order = order1;

            var payment2 = new Payment
            {
                Id = 2,
                UserId = otherUser.Id,
                User = otherUser,
                status = 2,
                TotalPrice = 20,
                DateCreate = DateTime.UtcNow,
            };

            var order2 = new Order
            {
                Id = 2,
                PaymentId = payment2.Id,
                Payment = payment2,
                DateEmission = DateTime.UtcNow,
                Status = 2,
            };

            payment2.Order = order2;

            context.Users.AddRange(user, otherUser);
            context.Products.Add(product);
            context.Payments.AddRange(payment1, payment2);
            context.OrderDetails.Add(detail1);
            context.Orders.AddRange(order1, order2);

            await context.SaveChangesAsync();

            var controller = new OrderController(context)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = BuildUserPrincipal(user.Id),
                    },
                },
            };

            var result = await controller.GetMyOrders();

            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok);

            var list = ok.Value as IEnumerable;
            Assert.IsNotNull(list);

            var count = CountItems(list);
            Assert.AreEqual(1, count);
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

        private static int CountItems(IEnumerable items)
        {
            var count = 0;
            foreach (var _ in items)
                count++;

            return count;
        }
    }
}