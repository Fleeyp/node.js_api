jest.mock("../repositories/orderRepository");

const orderService = require("../services/orderService");
const orderRepository = require("../repositories/orderRepository");

describe("OrderService", () => {

    test("should create order", async () => {

        orderRepository.createOrder.mockResolvedValue();

        const mockOrder = {
            numeroPedido: "123-1",
            dataCriacao: "2024-01-01",
            valorTotal: 1000,
            items: []
        };

        await orderService.createOrder(mockOrder);

        expect(orderRepository.createOrder).toHaveBeenCalled();

    });

});