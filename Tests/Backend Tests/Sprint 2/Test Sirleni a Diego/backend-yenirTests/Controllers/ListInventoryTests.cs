using backend_yenir.Controllers;
using backend_yenir.Data;
using backend_yenir.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace ListInventory.Tests
{
    [TestClass()]
    public class ListInventoryTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "InventoryTestDb")
                .Options;

            var context = new ApplicationDbContext(options);

            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            return context;
        }

        [TestMethod]
        public async Task GetAll_ShouldReturnMaterialsOrderedByName()
        {
            // Arrange
            var context = GetDbContext();

            context.Inventories.AddRange(
                new Inventory { Name = "Zinc", Descripcion = "Material Z", Stock = 5 },
                new Inventory { Name = "Aluminio", Descripcion = "Material A", Stock = 10 },
                new Inventory { Name = "Cobre", Descripcion = "Material C", Stock = 8 }
            );

            await context.SaveChangesAsync();

            var controller = new InvetoryController(context);

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
            Assert.AreEqual(3, count);

            var materials = ((System.Collections.IEnumerable)dataProperty.GetValue(response))
                .Cast<object>()
                .ToList();

            var firstName = materials[0].GetType().GetProperty("Name").GetValue(materials[0]).ToString();
            var secondName = materials[1].GetType().GetProperty("Name").GetValue(materials[1]).ToString();
            var thirdName = materials[2].GetType().GetProperty("Name").GetValue(materials[2]).ToString();

            Assert.AreEqual("Aluminio", firstName);
            Assert.AreEqual("Cobre", secondName);
            Assert.AreEqual("Zinc", thirdName);


  
        }
    }
}