using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.DTOs.Reviews;
using backend_yenir.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace CreateReview.Tests
{
    [TestClass()]
    public class CreateReviewTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [TestMethod]
        public async Task CreateReview_ShouldCreateReviewSuccessfully()
        {
            // Arrange
            var context = GetDbContext();

            // Crear producto existente
            var product = new Product
            {
                Name = "Laptop",
                Price = 1000
            };

            context.Products.Add(product);
            await context.SaveChangesAsync();

            var controller = new ReviewsController(context);

            // Simular usuario autenticado con Claim
            var userId = 1;
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };

            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = claimsPrincipal }
            };

            var dto = new CreateReviewDTO
            {
                ProductId = product.Id,
                Comment = "Excelente producto",
                Calification = 5
            };

            // Act
            var result = await controller.CreateReview(dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var reviewInDb = await context.Reviews.FirstOrDefaultAsync();

            Assert.IsNotNull(reviewInDb);
            Assert.AreEqual(userId, reviewInDb.UserId);
            Assert.AreEqual(product.Id, reviewInDb.ProductId);
            Assert.AreEqual("Excelente producto", reviewInDb.Comment);
            Assert.AreEqual(5, reviewInDb.Calification);
        }
    }
}