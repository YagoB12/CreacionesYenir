using Xunit;
using backend_yenir.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

namespace Test_Anthony_a_Dilan.ShoppingCar
{
    public class Delete_Tests : CartTestBase
    {
        [Fact]
        public async Task DeleteToCart_CartDoesNotExist_ReturnsBadRequest()
        {
            var context = GetDb();
            var controller = GetControllerWithUser(context, UserId);

            var result = await controller.DeleteToCart(999);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("No se puede eliminar un producto de un carrito que no existe", bad.Value);
        }

        [Fact]
        public async Task DeleteToCart_ProductNotInCart_ReturnsBadRequest()
        {
            var context = GetDb();
            context.ShoppingCarts.Add(new ShoppingCart { UserId = UserId, Total = 0m });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var result = await controller.DeleteToCart(111);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Debe existir el producto en el carrito", bad.Value);
        }

        [Fact]
        public async Task DeleteToCart_ProductDoesNotExist_ReturnsBadRequest()
        {
            var context = GetDb();

            var cart = new ShoppingCart { UserId = UserId, Total = 5000m };
            context.ShoppingCarts.Add(cart);
            await context.SaveChangesAsync();

            context.ShoppingCartItems.Add(new ShoppingCartItem
            {
                ShoppingCartId = cart.Id,
                ProductId = 1234,
                Quantity = 1,
                UnitPrice = 5000m,
                SubTotal = 5000m
            });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var result = await controller.DeleteToCart(1234);

            var bad = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("El producto a eliminar no existe", bad.Value);
        }

        [Fact]
        public async Task DeleteToCart_RemovesProductFromCart()
        {
            var context = GetDb();

            var product = new Product
            {
                Id = 808,
                Name = "Cable USB-C 2m",
                Img = "https://cdn.ejemplo.com/products/cable-usbc.png",
                Price = 3990.00m,
                Stock = 100
            };
            context.Products.Add(product);
            await context.SaveChangesAsync();

            var cart = new ShoppingCart { UserId = UserId, Total = 3990.00m };
            context.ShoppingCarts.Add(cart);
            await context.SaveChangesAsync();

            context.ShoppingCartItems.Add(new ShoppingCartItem
            {
                ShoppingCartId = cart.Id,
                ProductId = 808,
                Quantity = 1,
                UnitPrice = 3990.00m,
                SubTotal = 3990.00m
            });
            await context.SaveChangesAsync();

            var controller = GetControllerWithUser(context, UserId);

            var result = await controller.DeleteToCart(808);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Se ha eliminado correctamente el producto del carrito de compras", ok.Value);

            Assert.Empty(context.ShoppingCartItems);
            var updatedCart = context.ShoppingCarts.First(c => c.UserId == UserId);
            Assert.Equal(0m, updatedCart.Total);
        }

        [Fact]
        public async Task DeleteToCart_ReturnsUnauthorized_WhenUserNotIdentified()
        {
            var context = GetDb();
            var controller = GetControllerWithoutUser(context);

            var result = await controller.DeleteToCart(808);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("No se pudo indentificar el usuario", unauthorized.Value);
        }
    }
}
