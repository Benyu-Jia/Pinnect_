# Pinnect Mobile App

## Getting Started

### Run it locally

1. Install [Expo CLI](https://docs.expo.io/versions/latest/workflow/expo-cli/)

```
[sudo] npm install -g expo-cli
```

_If permissions errors then please use `--unsafe-perm=true` flag too [npm/npm#16766](https://github.com/npm/npm/issues/16766)_

2. Clone the project

```
git clone git@github.com:Nova41/Pinnect.git
```

3. Install dependencies

```
cd Pinnect/app

# Using npm
npm install
```

4. Run the cross-platform app (uses [Expo](https://expo.io/learn))

```
npm start
```

### Deploy

_To be continued_

### Upgrading SDK

To upgrade Expo, simply run

```
cd Pinnect/app
expo upgrade
```

If you encounter weird errors like custom font not loading, it is possibly because some modules in the project are
incompatible, but for some reason the issue is not repored.

In case that happens, you can try running `expo upgrade` inside the `app` folder. The command will clear expo caches,
check for module imcompatibilities and redownload modules if required, and reinstall Expo Go on the simulators.

Read more about [Upgrading Expo SDK](https://docs.expo.io/workflow/upgrading-expo-sdk-walkthrough/)

## Coding Style

### Naming Conventions

Componenets should be named in a manner similar to React Native's components.

| Item           | Style          | Example
|----------------|----------------|-----------------------------------
| Class name     | `CamelCase`    | `FlatButton` `InputBox`
| JS file name   | `snake-case`   | `flatbutton.js` `inputbox.js` or `flat-button.js` `input-box.js`

### Component Implementations

Componenets should accept props in a manner similar to React Native's components, and have consistent namings for props.

For example:

```
<FlatButton
  class="primary"
  onPress={() => something}
/>
```