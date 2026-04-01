using Xunit;
using backend_yenir.Models;
using backend_yenir.DTOs.ShoppingCart;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

namespace Test_Anthony_a_Dilan.ShoppingCar
{
    public class Get_Tests : CartTestBase
    {
        [Fact]
        public async Task GetCart_ReturnsUnauthorized_WhenUserNotIdentified()
        {
            var context = GetDb();
            var controller = GetControllerWithoutUser(context);

            var result = await controller.GetCart();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Usuario no identificado", unauthorized.Value);
        }

        [Fact]
        public async Task GetCart_CreatesCart_WhenDoesNotExist()
        {
            var context = GetDb();
            var controller = GetControllerWithUser(context, UserId);

            var result = await controller.GetCart();

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);

            var cart = context.ShoppingCarts.FirstOrDefault(c => c.UserId == UserId);
            Assert.NotNull(cart);
            Assert.Equal(0m, cart!.Total);
        }

        [Fact]
        public async Task GetCart_ReturnsItemsMapped_WhenCartHasItems()
        {
            var context = GetDb();

            var product = new Product
            {
                Id = 101,
                Name = "Camiseta Básica Negra",
                Img = "https://cdn.ejemplo.com/products/camiseta-negra.png",
                Price = 8990.50m,
                Stock = 25
            };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var cart = new ShoppingCart { UserId = UserId, Total = 0m };
            context.ShoppingCarts.Add(cart);
            await context.SaveChangesAsync();

            context.ShoppingCartItems.Add(new ShoppingCartItem
            {
                ShoppingCartId = cart.Id,
                ProductId = product.Id,
                Quantity = 2,
                UnitPrice = product.Price,
                SubTotal = 2 * product.Price
            });
            await context.SaveChangesAsync();

            cart.Total = context.ShoppingCartItems.Where(i => i.ShoppingCartId == cart.Id).Sum(i => i.SubTotal);
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var result = await controller.GetCart();

            var ok = Assert.IsType<OkObjectResult>(result);
            var dto = Assert.IsType<ShoppingCartDTO>(ok.Value);

            Assert.Equal(UserId, dto.UserId);
            Assert.Single(dto.Items);
            Assert.Equal("Camiseta Básica Negra", dto.Items[0].ProductName);
            Assert.Equal(product.Img, dto.Items[0].ProductImage);
            Assert.Equal(2, dto.Items[0].Quantity);
            Assert.Equal(17981.00m, dto.Items[0].Subtotal);
        }
    }
}
