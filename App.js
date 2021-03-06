import React, { Component } from 'react'
import { StyleSheet, View, Button, Text } from 'react-native'
import RNAccountKit from 'react-native-facebook-account-kit'

const API_URL = 'http://localhost:3000'

export default class App extends Component {
  state = {
    jwt: null,
    me: null,
  }

  componentDidMount() {
    RNAccountKit.configure({
      responseType: 'code',
      initialPhoneCountryPrefix: '+54',
      defaultCountry: 'AR',
    })
  }

  handleLoginButtonPress = async () => {
    try {
      const payload = await RNAccountKit.loginWithPhone()

      if (!payload) {
        return
      }

      const { code } = payload

      await this.getJWT(code)
    } catch (err) {
      alert('Error en autenticación con Facebook.')
    }
  }

  handleLogoutPress = () => this.setState({ jwt: null, me: null })

  getJWT = async code => {
    const url = `${API_URL}/auth?code=${code}`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      alert('No se pudo obtener el JWT')
      return
    }

    const { jwt } = await res.json()
    this.setState({ jwt })
  }

  handleGetMePress = async () => {
    const url = `${API_URL}/me`
    const { jwt } = this.state

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    })

    if (res.status === 403) {
      alert('Usuario no autorizado')
      return
    } else if (!res.ok) {
      alert('No se pudo obtener el perfil')
      return
    }

    const me = await res.json()
    this.setState({ me })
  }

  render() {
    const { jwt, me } = this.state

    const authenticated = !!jwt
    const phone = !!me && me.phone

    return (
      <View style={styles.container}>
        {!authenticated && <Button title="Login" onPress={this.handleLoginButtonPress} />}

        {authenticated && (
          <View style={styles.container}>
            <Text style={styles.title}>Bienvenido!</Text>

            <Text style={styles.jwt}>{jwt}</Text>

            {phone && <Text style={styles.phone}>Teléfono: {phone.number}</Text>}

            <Button title="Obtener Perfil" onPress={this.handleGetMePress} />
            <Button title="Salir" onPress={this.handleLogoutPress} />
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    fontWeight: 'bold',
    padding: 20,
    fontSize: 20,
  },
  phone: {
    padding: 20,
    fontSize: 14,
  },

  phone: {
    padding: 20,
    fontSize: 14,
  },
})
