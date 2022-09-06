# webpackDontRepackPlugin

One line of code to solve repeated packaging of webpack

![Example 1](https://github.com/aweiu/webpack-dont-repack-plugin/raw/main/examples/1.png)

## Install

```
npm install webpack-dont-repack-plugin
```

## Use

```
// Your webpack config
{
  ...
  plugins: [
      new WebpackDontRepackPlugin()
  ],
  ...
}
```

## Config

```
new WebpackDontRepackPlugin({
  log: false // default: true
})
```

If `log: true`, you will see in the console after the build is completed:

![Example 2](https://github.com/aweiu/webpack-dont-repack-plugin/raw/main/examples/2.png)

## Risk

I wonder if you are curious about this: why does the webpack official not directly repair such an obvious and long-standing problem? One possible explanation is "historical baggage", that is, solving the problem of repeated packaging may produce additional side effects.

What side effects can a module with the same name and version be packaged into one?

This is also something I came up with by chance. I directly put the code on it. It is assumed that this is a module that was originally packaged into multiple copies and later packaged into one:

```javascript
let i = 1;

function test() {
  console.log(i++);
}

export default test;
```

After reading the code, you should have understood it.

After the module package becomes one, the referenced instance also becomes one. In fact, it is not easy to say whether this is a side effect, because the expectation of each dependency may be one instance, but because of the Download Strategy of the existing package management tool, it has become multiple.

**So, It still needs more testing.**
