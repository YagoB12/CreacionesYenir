using Xunit;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.DTOs.Payments;
using backend_yenir.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace Test_Anthony_a_Sirleny.Bills
{
    public class Create_Tests
    {
        private const int UserId = 1;

        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private BillController GetControllerWithClientUser(ApplicationDbContext context, int userId)
        {
            var controller = new BillController(context, null!); //  NO instanciamos ImageService

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        new Claim(ClaimTypes.Role, "CLIENT"),
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        // CREATE BILL - Éxito
        [Fact]
        public async Task CreateBill_CreatesSuccessfully_WhenDataIsValid()
        {
            // Arrange
            var context = GetDb();

            // Usuario (con TODOS los campos Required de tu modelo)
            context.Users.Add(new User
            {
                Id = UserId,
                Name = "Andrea",
                LastName = "Ramírez",
                BirthDay = new DateTime(2002, 6, 15),
                Email = "andrea.ramirez@test.com",
                PasswordHash = "HASH_TEST_123",
                Role = UserRole.CLIENT, // <-- cambia a UserRole.CLIENT si tu enum usa mayúsculas
                PhoneNumber = "88888888",
                Gender = "F",
                Province = "San José",
                Canton = "Montes de Oca",
                District = "San Pedro"
            });

            // Productos (reales)
            context.Products.AddRange(
                new Product
                {
                    Id = 10,
                    Name = "Camiseta Básica Negra",
                    Img = "https://cdn.ejemplo.com/products/camiseta-negra.png",
                    Price = 8990.50m,
                    Stock = 10
                },
                new Product
                {
                    Id = 11,
                    Name = "Audífonos Bluetooth",
                    Img = "https://cdn.ejemplo.com/products/audifonos-bt.png",
                    Price = 24500.00m,
                    Stock = 5
                }
            );

            // Carrito existente (para validar que lo limpia)
            context.ShoppingCarts.Add(new ShoppingCart
            {
                UserId = UserId,
                Total = 0m
            });

            await context.SaveChangesAsync();

            var controller = GetControllerWithClientUser(context, UserId);

            var dto = new PaymentDTO
            {
                orderPayment = new List<OrderPaymentDTO>
                {
                    new OrderPaymentDTO { ProductId = 10, Quantity = 2 }, // 2 * 8990.50 = 17981.00
                    new OrderPaymentDTO { ProductId = 11, Quantity = 1 }  // 1 * 24500.00 = 24500.00
                },
                Img = null
            };

            // Act
            var result = await controller.CreateBill(dto);

            // Assert (respuesta OK)
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);

            // Validar respuesta 
            var message = (string)ok.Value!.GetType().GetProperty("message")!.GetValue(ok.Value)!;
            var billId = (int)ok.Value!.GetType().GetProperty("billId")!.GetValue(ok.Value)!;
            var paymentId = (int)ok.Value!.GetType().GetProperty("paymentId")!.GetValue(ok.Value)!;
            var total = (decimal)ok.Value!.GetType().GetProperty("total")!.GetValue(ok.Value)!;

            Assert.Equal("Factura creada correctamente", message);
            Assert.True(billId > 0);
            Assert.True(paymentId > 0);

            // Total esperado = 17981.00 + 24500.00 = 42481.00
            Assert.Equal(42481.00m, total);

            // Validar que Payment se creó
            var payment = context.Payments
                .Include(p => p.OrderDetails)
                .FirstOrDefault(p => p.Id == paymentId);

            Assert.NotNull(payment);
            Assert.Equal(UserId, payment!.UserId);
            Assert.Equal(42481.00m, payment.TotalPrice);
            Assert.Equal(2, payment.OrderDetails.Count);

            // Validar que Bill se creó
            var bill = context.Bills.FirstOrDefault(b => b.Id == billId);
            Assert.NotNull(bill);
            Assert.Equal(UserId, bill!.ClientId);
            Assert.Equal(paymentId, bill.PaymentId);
            Assert.Equal(42481.00m, bill.TotalAmount);

            // Validar stock reducido
            var p1 = await context.Products.FindAsync(10);
            var p2 = await context.Products.FindAsync(11);

            Assert.Equal(8, p1!.Stock); // 10 - 2
            Assert.Equal(4, p2!.Stock); // 5 - 1

            // Validar carrito limpiado
            Assert.Empty(context.ShoppingCarts.Where(c => c.UserId == UserId));
        }
    }
}