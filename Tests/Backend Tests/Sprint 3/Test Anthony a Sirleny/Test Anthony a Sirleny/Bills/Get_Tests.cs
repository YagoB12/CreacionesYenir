using Xunit;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace Test_Anthony_a_Sirleny.Bills
{
    public class Get_Tests
    {
        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private BillController GetControllerAsAdmin(ApplicationDbContext context)
        {
            var controller = new BillController(context, null!);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "99"),
                new Claim(ClaimTypes.Role, "ADMIN"),
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        private static T GetAnonProp<T>(object obj, string propName)
        {
            var prop = obj.GetType().GetProperty(propName);
            Assert.NotNull(prop);
            return (T)prop!.GetValue(obj)!;
        }

       
        // GET BILLS - Retorna facturas con Payment
        [Fact]
        public async Task GetBills_ReturnsOk_WithBillsAndPayment_WhenBillsExist()
        {
            // Arrange
            var context = GetDb();

            context.Users.Add(new User
            {
                Id = 1,
                Name = "Andrea",
                LastName = "Ramírez",
                BirthDay = new DateTime(2002, 6, 15),
                Email = "andrea@test.com",
                PasswordHash = "HASH_TEST",
                Role = UserRole.ADMIN, 
                PhoneNumber = "88888888",
                Gender = "F",
            });

            // Payment 1 (más viejo)
            var p1 = new Payment
            {
                DateCreate = DateTime.UtcNow.AddDays(-2),
                status = 1,
                TotalPrice = 10000m,
                Img = null,
                UserId = 1
            };

            // Payment 2 (más nuevo)
            var p2 = new Payment
            {
                DateCreate = DateTime.UtcNow.AddDays(-1),
                status = 1,
                TotalPrice = 25000m,
                Img = null,
                UserId = 1
            };

            context.Payments.AddRange(p1, p2);
            await context.SaveChangesAsync();

            context.Bills.AddRange(
                new Bill
                {
                    NumBill = "FAC-20260222-1",
                    NameClient = "Andrea Ramírez",
                    AddressClient = "San José Montes de Oca San Pedro",
                    DateEmission = DateTime.UtcNow.AddDays(-2),
                    TotalAmount = 10000m,
                    Status = 1,
                    ClientId = 1,
                    PaymentId = p1.Id,
                    Payment = p1
                },
                new Bill
                {
                    NumBill = "FAC-20260222-2",
                    NameClient = "Andrea Ramírez",
                    AddressClient = "San José Montes de Oca San Pedro",
                    DateEmission = DateTime.UtcNow.AddDays(-1),
                    TotalAmount = 25000m,
                    Status = 1,
                    ClientId = 1,
                    PaymentId = p2.Id,
                    Payment = p2
                }
            );

            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            // Act
            var result = await controller.GetBills();

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);

            var message = GetAnonProp<string>(ok.Value!, "message");
            var count = GetAnonProp<int>(ok.Value!, "count");
            var data = GetAnonProp<System.Collections.IEnumerable>(ok.Value!, "data")
                .Cast<object>()
                .ToList();

            Assert.Equal("Facturas obtenidas correctamente", message);
            Assert.Equal(2, count);
            Assert.Equal(2, data.Count);

            // Validar que vienen ordenadas desc por DateEmission
            var firstDate = GetAnonProp<DateTime>(data[0], "DateEmission");
            var secondDate = GetAnonProp<DateTime>(data[1], "DateEmission");
            Assert.True(firstDate >= secondDate);

            // Validar que viene Payment incluido en el primer elemento
            var paymentObj = GetAnonProp<object>(data[0], "Payment");
            var paymentId = GetAnonProp<int>(paymentObj, "Id");
            var paymentTotal = GetAnonProp<decimal>(paymentObj, "TotalPrice");

            Assert.True(paymentId > 0);
            Assert.True(paymentTotal > 0);
        }
    }
}