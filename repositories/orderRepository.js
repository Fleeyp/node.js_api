const filterRepository = require("./filterRepository");

class OrderRepository {

    async createOrder(order) {

        await filterRepository.insert("Order", {
            orderId: order.orderId,
            value: order.value,
            creationDate: order.creationDate
        });

        for (const item of order.items) {

            await filterRepository.insert("Items", {
                orderId: order.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            });

        }

    }

    async getOrder(orderId) {

        const order = await filterRepository.findOne("Order", {
            orderId: orderId
        });

        if (!order) return null;

        const items = await filterRepository.findAll("Items", {
            orderId: orderId
        });

        order.items = items;

        return order;

    }

    async listOrders() {

        return await filterRepository.findAll("Order");

    }

    async deleteOrder(orderId) {

        await filterRepository.delete("Items", {
            orderId: orderId
        });

        return await filterRepository.delete("Order", {
            orderId: orderId
        });

    }

    async updateOrder(order) {

        await filterRepository.update(
            "Order",
            {
                value: order.value,
                creationDate: order.creationDate
            },
            {
                orderId: order.orderId
            }
        );

        await filterRepository.delete("Items", {
            orderId: order.orderId
        });

        for (const item of order.items) {

            await filterRepository.insert("Items", {
                orderId: order.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            });

        }

    }

}

module.exports = new OrderRepository();