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

namespace UpdateReview.Tests
{
    [TestClass()]
    public class UpdateReviewTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        private ReviewsController GetControllerWithUser(ApplicationDbContext context, int userId)
        {
            var controller = new ReviewsController(context);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };

            return controller;
        }

        [TestMethod]
        public async Task UpdateReview_ShouldUpdateSuccessfully_WhenOwner()
        {
            // Arrange
            var context = GetDbContext();

            var review = new Review
            {
                UserId = 1,
                ProductId = 1,
                Comment = "Comentario viejo",
                Calification = 3,
                DateCreate = DateTime.UtcNow
            };

            context.Reviews.Add(review);
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, 1);

            var dto = new UpdateReviewDTO
            {
                Comment = "Comentario actualizado",
                Calification = 5
            };

            // Act
            var result = await controller.UpdateReview(review.Id, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var updatedReview = await context.Reviews.FindAsync(review.Id);

            Assert.AreEqual("Comentario actualizado", updatedReview.Comment);
            Assert.AreEqual(5, updatedReview.Calification);
        }

        [TestMethod]
        public async Task UpdateReview_ShouldReturnForbid_WhenNotOwner()
        {
            // Arrange
            var context = GetDbContext();

            var review = new Review
            {
                UserId = 1,
                ProductId = 1,
                Comment = "Comentario",
                Calification = 4,
                DateCreate = DateTime.UtcNow
            };

            context.Reviews.Add(review);
            await context.SaveChangesAsync();

            // Usuario diferente (2)
            var controller = GetControllerWithUser(context, 2);

            var dto = new UpdateReviewDTO
            {
                Comment = "Intento de cambio"
            };

            // Act
            var result = await controller.UpdateReview(review.Id, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(ForbidResult));
        }

        [TestMethod]
        public async Task UpdateReview_ShouldReturnNotFound_WhenReviewDoesNotExist()
        {
            // Arrange
            var context = GetDbContext();
            var controller = GetControllerWithUser(context, 1);

            var dto = new UpdateReviewDTO
            {
                Comment = "Nuevo comentario"
            };

            // Act
            var result = await controller.UpdateReview(999, dto);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }
    }
}