using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using backend_yenir.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace ListPendingBill.Tests
{
    [TestClass()]
    public class ListPendingBillTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [TestMethod]
        public async Task GetPendingBills_ShouldReturnOnlyPendingBills()
        {
            // Arrange
            var context = GetDbContext();

            const int PENDING = 1;
            const int APPROVED = 2;

            var client = new User
            {
                Name = "Juan",
                LastName = "Perez",
                Email = "juan@test.com",
                Gender = "Masculino",
                PasswordHash = "Test12345",
                PhoneNumber = "88887777"
            };

            context.Users.Add(client);
            await context.SaveChangesAsync();

            var paymentPending = new Payment
            {
                status = PENDING,
                TotalPrice = 1000,
                DateCreate = DateTime.UtcNow,
                OrderDetails = new List<OrderDetail>()
            };

            var paymentApproved = new Payment
            {
                status = APPROVED,
                TotalPrice = 500,
                DateCreate = DateTime.UtcNow,
                OrderDetails = new List<OrderDetail>()
            };

            context.Payments.AddRange(paymentPending, paymentApproved);
            await context.SaveChangesAsync();

            var billPending = new Bill
            {
                NumBill = "F001",
                DateEmission = DateTime.UtcNow,
                TotalAmount = 1000,
                Status = PENDING,
                NameClient = "Juan Perez",
                AddressClient = "San José, Costa Rica",
                ClientId = client.Id,
                PaymentId = paymentPending.Id
            };

            var billApproved = new Bill
            {
                NumBill = "F002",
                DateEmission = DateTime.UtcNow,
                TotalAmount = 500,
                Status = APPROVED,
                NameClient = "Juan Perez",
                AddressClient = "San José, Costa Rica",
                ClientId = client.Id,
                PaymentId = paymentApproved.Id
            };

            context.Bills.AddRange(billPending, billApproved);
            await context.SaveChangesAsync();

            //  Crear entorno falso (NO toca imágenes reales)
            var mockEnv = new Mock<IWebHostEnvironment>();
            mockEnv.Setup(e => e.WebRootPath).Returns("wwwroot");

            var imageService = new ImageService(mockEnv.Object);

            var controller = new BillController(context, imageService);

            // Act
            var result = await controller.GetPendingBills();

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var bills = okResult.Value as IEnumerable<object>;
            Assert.IsNotNull(bills);

            var list = bills.ToList();

            // Solo debe traer la pendiente
            Assert.AreEqual(1, list.Count);
        }
    }
}