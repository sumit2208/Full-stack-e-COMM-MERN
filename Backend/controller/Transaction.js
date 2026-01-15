import Razorpay from "razorpay"; 

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET_KEY,
});

export const getAllTransactions = async (req, res) => {
  try {
    const payments = await rzp.payments.all();
    res.status(200).send({
      success: true,
      items: payments.items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const payment = await rzp.payments.fetch(req.params.id);

    res.status(200).send({
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

