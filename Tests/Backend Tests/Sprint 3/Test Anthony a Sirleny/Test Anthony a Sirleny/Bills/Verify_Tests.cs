using Xunit;
using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;

namespace Test_Anthony_a_Sirleny.Bills
{
    public class Verify_Tests
    {
        private const int ADMIN_ID = 99;

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
                new Claim(ClaimTypes.NameIdentifier, ADMIN_ID.ToString()),
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

        // VERIFY - Aprobado exitoso
        [Fact]
        public async Task VerifyPayment_ApprovesSuccessfully_WhenPending()
        {
            // Arrange
            var context = GetDb();

            var payment = new Payment
            {
                DateCreate = DateTime.UtcNow,
                status = 1, // pendiente
                TotalPrice = 42481.00m,
                Img = null,
                UserId = 1
            };
            context.Payments.Add(payment);
            await context.SaveChangesAsync();

            var bill = new Bill
            {
                NumBill = "FAC-20260222-200",
                NameClient = "Andrea Ramírez",
                AddressClient = "San José, Montes de Oca, San Pedro",
                DateEmission = DateTime.UtcNow,
                TotalAmount = 42481.00m,
                Status = 1, // pendiente
                ClientId = 1,
                PaymentId = payment.Id,
                Payment = payment
            };
            context.Bills.Add(bill);
            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            // Act
            var result = await controller.VerifyPayment(billId: bill.Id, status: 2);

            // Assert (respuesta)
            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);

            var message = GetAnonProp<string>(ok.Value!, "message");
            var returnedBillId = GetAnonProp<int>(ok.Value!, "billId");
            var returnedPaymentId = GetAnonProp<int>(ok.Value!, "paymentId");
            var newStatus = GetAnonProp<int>(ok.Value!, "newStatus");

            Assert.Equal("Pago aprobado correctamente.", message);
            Assert.Equal(bill.Id, returnedBillId);
            Assert.Equal(payment.Id, returnedPaymentId);
            Assert.Equal(2, newStatus);

            // Assert (BD actualizada)
            var billDb = await context.Bills.Include(b => b.Payment).FirstAsync(b => b.Id == bill.Id);
            Assert.Equal(2, billDb.Status);
            Assert.Equal(2, billDb.Payment.status);
        }
    }
}