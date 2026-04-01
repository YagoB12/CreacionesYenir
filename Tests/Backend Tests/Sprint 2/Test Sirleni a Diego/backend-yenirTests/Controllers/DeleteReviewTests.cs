using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DeleteReview.Tests
{
    [TestClass()]
    public class DeleteReviewTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [TestMethod]
        public async Task DeleteReviewByAdmin_ShouldDeleteSuccessfully()
        {
            // Arrange
            var context = GetDbContext();

            var user = new User { Name = "AdminUser",
                Email = "yor@gmail.com",
                Gender = "Femenino",
                LastName = "Aguilar",
                PasswordHash = "12456789Yy",
                PhoneNumber = "123364458"
            };
            var product = new Product { Name = "Mouse", Price = 50 };

            context.Users.Add(user);
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var review = new Review
            {
                UserId = user.Id,
                ProductId = product.Id,
                Comment = "Comentario a eliminar",
                Calification = 4,
                DateCreate = DateTime.UtcNow
            };

            context.Reviews.Add(review);
            await context.SaveChangesAsync();

            var controller = new ReviewsController(context);

            // Act
            var result = await controller.DeleteReviewByAdmin(review.Id);

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var reviewInDb = await context.Reviews.FindAsync(review.Id);
            Assert.IsNull(reviewInDb); // Ya no debe existir
        }

        [TestMethod]
        public async Task DeleteReviewByAdmin_ShouldReturnNotFound_WhenReviewDoesNotExist()
        {
            // Arrange
            var context = GetDbContext();
            var controller = new ReviewsController(context);

            // Act
            var result = await controller.DeleteReviewByAdmin(999);

            // Assert
            Assert.IsInstanceOfType(result, typeof(NotFoundObjectResult));
        }
    }
}