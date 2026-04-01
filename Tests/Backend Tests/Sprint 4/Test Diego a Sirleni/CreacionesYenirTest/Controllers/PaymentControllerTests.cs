using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace creacionesYenir.Tests
{
    [TestClass]
    public class VerifyPaymentTests
    {
        /// Crea una base de datos en memoria para ejecutar las pruebas
        /// sin necesidad de usar SQL Server real.
        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }


        /// Crea el controlador como si fuera un usuario ADMIN autenticado.
        /// Solo se mockea IConfiguration, los demás servicios se usan reales.
        private PaymentController GetControllerAsAdmin(ApplicationDbContext context)
        {
            var configMock = new Mock<IConfiguration>();

            configMock.Setup(c => c["Smtp:AdminContact"])
                .Returns("admin@test.com");

            configMock.Setup(c => c["Smtp:User"])
                .Returns("admin@test.com");

            var emailTemplateService = new EmailTemplateService();
            var billPdfService = new BillPdfService();
            var emailService = new EmailService(configMock.Object);

            var controller = new PaymentController(
                context,
                emailService,
                configMock.Object,
                billPdfService,
                emailTemplateService
            );

            // Simula un usuario autenticado con rol ADMIN
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

        /// Método auxiliar para leer propiedades anónimas del resultado Ok().
        private static T GetAnonProp<T>(object obj, string propName)
        {
            var prop = obj.GetType().GetProperty(propName);
            Assert.IsNotNull(prop);
            return (T)prop!.GetValue(obj)!;
        }

        // ================================================================
        // TEST 1: Caso exitoso - Pago pendiente aprobado correctamente
        // ================================================================
        [TestMethod]
        public async Task VerifyPayment_ApprovesSuccessfully_WhenPending()
        {
            // Arrange → Se crean entidades válidas en estado PENDIENTE
            var context = GetDb();

            var user = new User
            {
                Id = 1,
                Name = "Ana",
                LastName = "Test",
                BirthDay = new DateTime(1990, 1, 1),
                Email = "ana@test.com",
                PasswordHash = "hash123",
                Role = UserRole.CLIENT,
                PhoneNumber = "88888888",
                Gender = "F"
            };

            var payment = new Payment
            {
                Id = 1,
                status = 1, // PENDIENTE
                DateCreate = DateTime.UtcNow,
                TotalPrice = 100,
                UserId = user.Id,
                User = user,
                OrderDetails = new List<OrderDetail>()
            };

            var bill = new Bill
            {
                Id = 1,
                NumBill = "FAC-001",
                NameClient = "Ana Test",
                AddressClient = "San José, Costa Rica",
                DateEmission = DateTime.UtcNow,
                TotalAmount = 100,
                Status = 1,
                ClientId = user.Id,
                PaymentId = payment.Id,
                Payment = payment
            };

            var order = new Order
            {
                Id = 1,
                Status = 1,
                PaymentId = payment.Id,
                Payment = payment
            };

            payment.Bill = bill;
            payment.Order = order;

            context.Users.Add(user);
            context.Payments.Add(payment);
            context.Bills.Add(bill);
            context.Orders.Add(order);

            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            // Act → Se aprueba el pago (status = 2)
            var result = await controller.VerifyPayment(payment.Id, 2);

            // Assert → Se valida que el resultado sea OK
            var ok = result as OkObjectResult;
            Assert.IsNotNull(ok);

            var newStatus = GetAnonProp<int>(ok.Value!, "newStatus");
            Assert.AreEqual(2, newStatus);

            // Se valida que la base de datos fue actualizada correctamente
            var paymentDb = await context.Payments
                .Include(p => p.Bill)
                .Include(p => p.Order)
                .FirstAsync(p => p.Id == payment.Id);

            Assert.AreEqual(2, paymentDb.status);
            Assert.AreEqual(2, paymentDb.Bill.Status);
            Assert.AreEqual(2, paymentDb.Order.Status);
        }

        // ================================================================
        // TEST 2: Status inválido → debe retornar BadRequest
        // ================================================================
        [TestMethod]
        public async Task VerifyPayment_ReturnsBadRequest_WhenStatusInvalid()
        {
            var context = GetDb();
            var controller = GetControllerAsAdmin(context);

            var result = await controller.VerifyPayment(1, 99);

            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        // ================================================================
        // TEST 3: Pago no existe → debe retornar NotFound
        // ================================================================
        [TestMethod]
        public async Task VerifyPayment_ReturnsNotFound_WhenPaymentDoesNotExist()
        {
            var context = GetDb();
            var controller = GetControllerAsAdmin(context);

            var result = await controller.VerifyPayment(999, 2);

            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

        // ================================================================
        // TEST 4: Pago ya verificado → debe retornar BadRequest
        // ================================================================
        [TestMethod]
        public async Task VerifyPayment_ReturnsBadRequest_WhenAlreadyVerified()
        {
            var context = GetDb();

            var user = new User
            {
                Id = 1,
                Name = "Ana",
                LastName = "Test",
                BirthDay = new DateTime(1990, 1, 1),
                Email = "ana@test.com",
                PasswordHash = "hash123",
                Role = UserRole.CLIENT,
                PhoneNumber = "88888888",
                Gender = "F"
            };

            var payment = new Payment
            {
                Id = 1,
                status = 2, // YA APROBADO
                DateCreate = DateTime.UtcNow,
                TotalPrice = 100,
                UserId = user.Id,
                User = user,
                OrderDetails = new List<OrderDetail>()
            };

            var bill = new Bill
            {
                Id = 1,
                NumBill = "FAC-001",
                NameClient = "Ana Test",
                AddressClient = "San José",
                DateEmission = DateTime.UtcNow,
                TotalAmount = 100,
                Status = 2,
                ClientId = user.Id,
                PaymentId = payment.Id,
                Payment = payment
            };

            payment.Bill = bill;

            context.Users.Add(user);
            context.Payments.Add(payment);
            context.Bills.Add(bill);

            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            var result = await controller.VerifyPayment(payment.Id, 2);

            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        // ================================================================
        // TEST 5: Pago sin factura → debe retornar BadRequest
        // ================================================================
        [TestMethod]
        public async Task VerifyPayment_ReturnsBadRequest_WhenBillIsNull()
        {
            var context = GetDb();

            var user = new User
            {
                Id = 1,
                Name = "Ana",
                LastName = "Test",
                BirthDay = new DateTime(1990, 1, 1),
                Email = "ana@test.com",
                PasswordHash = "hash123",
                Role = UserRole.CLIENT,
                PhoneNumber = "88888888",
                Gender = "F"
            };

            var payment = new Payment
            {
                Id = 1,
                status = 1,
                DateCreate = DateTime.UtcNow,
                TotalPrice = 100,
                UserId = user.Id,
                User = user,
                OrderDetails = new List<OrderDetail>()
                // SIN FACTURA
            };

            context.Users.Add(user);
            context.Payments.Add(payment);

            await context.SaveChangesAsync();

            var controller = GetControllerAsAdmin(context);

            var result = await controller.VerifyPayment(payment.Id, 2);

            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }
    }
}