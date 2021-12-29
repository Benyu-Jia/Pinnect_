import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import PropTypes from 'prop-types'
import AppText from "../../../components/app-text";

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 25,
  },
  emailColumn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  emailIcon: {
    color: 'gray',
    fontSize: 30,
  },
  emailNameColumn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  emailNameText: {
    //fontFamily: "Roboto-Regular",
    color: 'gray',
    fontSize: 14,
    //fontWeight: '200',
  },
  emailRow: {
    flex: 8,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  emailText: {
    //fontFamily: "Roboto-Regular",
    fontSize: 16,
  },
  iconRow: {
    flex: 2,
    justifyContent: 'center',
  },
})

const renderEmailText = (email: any) => {
  if(email != null) {
    return (<AppText style={styles.emailText}>{email}</AppText>);
  } else {
    return (<AppText style={styles.emailText}>Email Not Registered</AppText>);
  }
}

const Email = ({ containerStyle, onPressEmail, name, email, index }) => (
  <TouchableOpacity onPress={() => onPressEmail(email)}>
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconRow}>
        {index === 0 && (
          <Icon
            name="email"
            underlayColor="transparent"
            iconStyle={styles.emailIcon}
            onPress={() => onPressEmail()}
          />
        )}
      </View>
      <View style={styles.emailRow}>
        <View style={styles.emailColumn}>
          {renderEmailText(email)}
        </View>
        <View style={styles.emailNameColumn}>
          {name.length !== 0 && (
            <AppText style={styles.emailNameText}>{name}</AppText>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
)

Email.propTypes = {
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  email: PropTypes.string,
  index: PropTypes.number,
  name: PropTypes.string,
  onPressEmail: PropTypes.func,
}

Email.defaultProps = {
  containerStyle: {},
  name: null,
}

export default Email
