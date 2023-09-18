/* @refresh reload */
import { render } from 'solid-js/web'

import './fonts.scss'
import './index.scss'
import App from './App'

const root = document.getElementById('__app__')

render(() => <App />, root!)
