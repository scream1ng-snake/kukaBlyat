import { useState } from 'react';
import './App.css';
import { Button, Checkbox, Dialog, Space } from 'antd-mobile';
import axios from 'axios';
import { v4 } from 'uuid';
import { config } from './config';
import { ConfType, confTypes, PaymentResult } from './types';
import { useTelegram } from './utils';
import { BrowserRouter, Route, Routes, useSearchParams } from 'react-router-dom';
const totalPrice = 10


function Opp() {
  const { tg } = useTelegram()
  const [params] = useSearchParams()
  console.log(params)
  const [payed, setPayed] = useState(false)
  const [type, setType] = useState<ConfType>('redirect')

  function doOrder() {
    console.log('делаем новый платеж')
    let body = {
      price: 5,
      returnUrl: "https://secret-prod-gurmag.netlify.app?payed=true",
      type
    }

    let headers = {
      'Idempotence-Key': v4(),
      'Content-Type': 'application/json',
    }

    let auth = {
      username: config.storeID,
      password: config.secretKey
    }

    axios.post('https://elipelisr.lexcloud.ru/elipelibottest/newPayment', body, { headers, auth })
      .then(response => {
        const data = response.data as PaymentResult
        console.log(data)
        switch (data.confirmation.type) {
          case 'embedded':
            // @ts-ignore
            let checkoutWidget = new window.YooMoneyCheckoutWidget({
              confirmation_token: data.confirmation.confirmation_token,
              customization: {
                //Настройка способа отображения
                modal: true
              },
              error_callback: function (error: any) {
                Dialog.show({ content: 'Не удалось оплатить' })
                checkoutWidget.destroy()
              }
            })
            checkoutWidget.on("success", () => {
              setPayed(true)
              console.log('Поздравляшки')
              Dialog.show({ content: 'Поздравляшки' })
              checkoutWidget.destroy()
            })
            checkoutWidget.on("fail", (err: any) => {
              checkoutWidget.destroy()
              console.error(err)
              Dialog.show({
                content: 'Что-то пошло не так c оплатой в Юкассе',
                actions: [{
                  key: 'close',
                  text: 'Закрыть'
                }]
              })
            })
            checkoutWidget.render('payment-form')
            break;
          case "redirect":
            const { confirmation_url } = data.confirmation
            if (tg && (tg.platform?.toLowerCase() === 'android' || tg.platform?.toLowerCase() === 'ios')) {
              console.log('open redirect url in tg.openLink')
              tg.openLink(confirmation_url)
            } else {
              console.log('open redirect url in window.open')
              window.open(confirmation_url)
            }
            break;
          default:
            throw new Error('Not implemented')
        }
      })
      .catch(console.error);
  }
  if (params.get('payed') === 'true') {
    return (
      <div className="App">
        <h2>
          <center>Поздравляем оплачено через redirect</center>
          <a href={window.location.origin}>
            <Button
              color='success'
              fill='solid'
            >
              На главную
            </Button>
          </a>
        </h2>
      </div>
    )
  }
  if (payed) {
    return (
      <div className="App">
        <h2>
          <center>Поздравляем оплачено</center>
        </h2>
      </div>
    )
  } else {
    return (
      <div className="App">
        <Space>
          {Object.keys(confTypes).map(key =>
            <Checkbox
              key={key}
              checked={key === type}
              onClick={() => setType(key as ConfType)}
            >
              {key}
            </Checkbox>
          )}
        </Space>
        <h2><center>{`${totalPrice} руб`}</center></h2>
        <Button onClick={doOrder}>Оплатить</Button>
      </div>
    );
  }
}

function App() {
  return <BrowserRouter>
    <Routes>
      <Route 
        path='/'
        element={<Opp />}
      />
    </Routes>
  </BrowserRouter>
}

export default App;
