using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace creacionesYenir.Tests
{
    [TestClass]
    public class DeleteOrderTests
    {
        private ApplicationDbContext GetDb()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private OrderController GetControllerAsClient(ApplicationDbContext context, int userId)
        {
            var controller = new OrderController(context);

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

        // ================================================================
        // TEST 1: Token inválido → Unauthorized
        // ================================================================
        [TestMethod]
        public async Task DeleteOrder_ReturnsUnauthorized_WhenTokenInvalid()
        {
            var context = GetDb();
            var controller = new OrderController(context);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.DeleteOrder(1);

            Assert.IsInstanceOfType(result, typeof(UnauthorizedObjectResult));
        }

        // ================================================================
        // TEST 2: Orden no existe → NotFound
        // ================================================================
        [TestMethod]
        public async Task DeleteOrder_ReturnsNotFound_WhenOrderDoesNotExist()
        {
            var context = GetDb();
            var controller = GetControllerAsClient(context, 1);

            var result = await controller.DeleteOrder(999);

            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }

        // ================================================================
        // TEST 3: Orden no pertenece al usuario → Forbid
        // ================================================================
        [TestMethod]
        public async Task DeleteOrder_ReturnsForbid_WhenOrderDoesNotBelongToUser()
        {
            var context = GetDb();

            var payment = new Payment
            {
                Id = 1,
                UserId = 99 // pertenece a otro usuario
            };

            var order = new Order
            {
                Id = 1,
                Status = 2,
                Payment = payment
            };

            context.Payments.Add(payment);
            context.Orders.Add(order);
            await context.SaveChangesAsync();

            var controller = GetControllerAsClient(context, 1); // usuario distinto

            var result = await controller.DeleteOrder(order.Id);

            Assert.IsInstanceOfType(result, typeof(ForbidResult));
        }

        // ================================================================
        // TEST 4: Orden no comprobada → BadRequest
        // ================================================================
        [TestMethod]
        public async Task DeleteOrder_ReturnsBadRequest_WhenOrderNotConfirmed()
        {
            var context = GetDb();

            var payment = new Payment
            {
                Id = 1,
                UserId = 1
            };

            var order = new Order
            {
                Id = 1,
                Status = 1, // no comprobado
                Payment = payment
            };

            context.Payments.Add(payment);
            context.Orders.Add(order);
            await context.SaveChangesAsync();

            var controller = GetControllerAsClient(context, 1);

            var result = await controller.DeleteOrder(order.Id);

            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult));
        }

        // ================================================================
        // TEST 5: Eliminación exitosa → Ok
        // ================================================================
        [TestMethod]
        public async Task DeleteOrder_ReturnsOk_WhenOrderIsDeletedSuccessfully()
        {
            var context = GetDb();

            var payment = new Payment
            {
                Id = 1,
                UserId = 1
            };

            var order = new Order
            {
                Id = 1,
                Status = 2, // comprobado
                Payment = payment
            };

            context.Payments.Add(payment);
            context.Orders.Add(order);
            await context.SaveChangesAsync();

            var controller = GetControllerAsClient(context, 1);

            var result = await controller.DeleteOrder(order.Id);

            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var deletedOrder = await context.Orders.FindAsync(order.Id);
            Assert.IsNull(deletedOrder); // verificar que realmente se eliminó
        }
    }
}