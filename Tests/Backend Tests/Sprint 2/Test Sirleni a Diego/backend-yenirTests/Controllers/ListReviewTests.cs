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

namespace ListReview.Tests
{
    [TestClass()]
    public class ListReviewTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [TestMethod]
        public async Task GetAll_ShouldReturnAllReviews()
        {
            // Arrange
            var context = GetDbContext();

            var user = new User
            {
                Name = "Yorleni", 
                Email= "yor@gmail.com",
                Gender="Femenino",
                LastName="Aguilar",
                PasswordHash="12456789Yy",
                PhoneNumber="123364458"
                
            };

            var product = new Product
            {
                Name = "Laptop",
                Price = 1200
            };

            context.Users.Add(user);
            context.Products.Add(product);
            await context.SaveChangesAsync();

            context.Reviews.AddRange(
                new Review
                {
                    UserId = user.Id,
                    ProductId = product.Id,
                    Comment = "Excelente",
                    Calification = 5,
                    DateCreate = DateTime.UtcNow
                },
                new Review
                {
                    UserId = user.Id,
                    ProductId = product.Id,
                    Comment = "Muy bueno",
                    Calification = 4,
                    DateCreate = DateTime.UtcNow
                }
            );

            await context.SaveChangesAsync();

            var controller = new ReviewsController(context);

            // Act
            var result = await controller.GetAll();

            // Assert
            Assert.IsInstanceOfType(result, typeof(OkObjectResult));

            var okResult = result as OkObjectResult;
            Assert.IsNotNull(okResult);

            var response = okResult.Value;

            var countProperty = response.GetType().GetProperty("count");
            var dataProperty = response.GetType().GetProperty("data");

            var count = (int)countProperty.GetValue(response);
            Assert.AreEqual(2, count);

            var reviews = ((System.Collections.IEnumerable)dataProperty.GetValue(response))
                .Cast<object>()
                .ToList();

            Assert.AreEqual(2, reviews.Count);
        }
    }
}