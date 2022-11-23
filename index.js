const express = require('express')
const cors = require('cors')
const TelegramBot = require('node-telegram-bot-api')

const token = '5588100521:AAFCVAEtRsqYjhOu7KagLTHV4zWP4ZsPTb4'
const webAppUrl = 'https://golden-seahorse-600acc.netlify.app'
const PORT = 8000

const app = express()
const bot = new TelegramBot(token, { polling: true })

app.use(express.json())
app.use(cors())

bot.on('message', async (msg) => {
	const chatId = msg.chat.id
	const text = msg.text

	if (text === '/start') {
		await bot.sendMessage(chatId, 'Fill the form', {
			reply_markup: {
				keyboard: [
					[{ text: 'Form', web_app: { url: `${webAppUrl}/form` } }]
				]
			}
		})

		await bot.sendMessage(chatId, 'Go to the store', {
			reply_markup: {
				inline_keyboard: [
					[{ text: 'Make an order', web_app: { url: webAppUrl } }]
				]
			}
		})
	}

	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data)
			console.log(data)
			await bot.sendMessage(chatId, 'Thanks for feedback')
			await bot.sendMessage(chatId, `Country: ${data?.country}`)
			await bot.sendMessage(chatId, `Street: ${data?.street}`)

			setTimeout(async () => {
				await bot.sendMessage(chatId, 'You can get all info in this chat')
			}, 3000)
		} catch (e) {
			console.log(e)
		}
	}
})

app.get("/", (req, res) => {
	res.send("Express on Vercel")
})

app.post('/web-data', async (req, res) => {
	const { queryId, products = [], totalPrice } = req.body
	try {
		await bot.answerWebAppQuery(queryId, {
			type: 'article',
			id: queryId,
			title: 'Payment completed',
			input_message_content: {
				message_text: `Your payment: ${totalPrice}, ${products.map(item => item.title).join(', ')}`
			}
		})
		return res.status(200).json({})
	} catch (e) {
		return res.status(500).json({})
	}
})

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))