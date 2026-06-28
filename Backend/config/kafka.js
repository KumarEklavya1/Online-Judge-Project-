import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'judge0x-main-backend',
  brokers: ['127.0.0.1:9092'] // 🔥 CHANGED FROM localhost TO 127.0.0.1
});

export const producer = kafka.producer();

export const connectProducer = async () => {
    try {
        await producer.connect();
        console.log("🚀 Kafka Producer connected successfully!");
    } catch (error) {
        console.error("❌ Kafka Producer connection failed:", error);
    }
};