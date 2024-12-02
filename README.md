# Obsidian Code Emitter

![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/mokeyish/obsidian-code-emitter?display_name=tag&include_prereleases)
![GitHub all releases](https://img.shields.io/github/downloads/mokeyish/obsidian-code-emitter/total?style=flat-square)

This plugin allows code blocks executed interactively like jupyter notebooks. It is based on HTTP REST APIs and JS sandbox and Webassembly technology, and has no local environment requirements, so it supports all platforms supported by Obsidian.

Supports all Obsidian supported platforms, includes:

- Windows
- MacOS
- Linux
- Android
- IOS

Currently, support languages:

| Supported language | Way                                                          |
| ------------------ | ------------------------------------------------------------ |
| Rust               | https://play.rust-lang.org                                   |
| Kotlin             | https://play.kotlinlang.org                                  |
| V                  | https://play.vosca.dev/                                      |
| HTML&CSS           | [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) |       
| JavaScript         | JS Sandbox ([qiankun](https://github.com/umijs/qiankun/blob/master/src/sandbox/index.ts)) |
| TypeScript[]       | [TypeScript](https://www.typescriptlang.org/) Compiler + JS Sandbox |
| Wenyan             | [Wenyan](https://github.com/wenyan-lang/wenyan)  Compiler + JS Sandbox |
| Python             | WebAssembly ([Pyodide](https://github.com/pyodide/pyodide))  |
| Java               | [Sololearn](https://www.sololearn.com)                       |
| Go                 | [Sololearn](https://www.sololearn.com)                       |
| c/c++              | [Sololearn](https://www.sololearn.com)                       |
| CSharp             | [Sololearn](https://www.sololearn.com)                       |
| Swift              | [Sololearn](https://www.sololearn.com)                       |
| R                  | [Sololearn](https://www.sololearn.com)                       |          

**Note**: Only `Python`、`TypeScript`、`JavaScript` are run locally in sandbox(js / webassembly). Other's will send
code to third-party website to eval the results (eg: https://play.kotlinlang.org, https://play.rust-lang.org).
Please take care to avoid sending your potentially-sensitive source code.


**Ads**: You might like my other plugins 🤪

- [Obsidian Enhancing Export](https://github.com/mokeyish/obsidian-enhancing-export)

---

![.](./screenshots/code-emitter.gif)

## Installation

1. Search `Code Emitter` in the community plugins of [obsidian](https://obsidian.md/), and install it.

## Examples

### Python

Install numpy through `micropip`. All available packages are list in [here](https://github.com/mokeyish/pyodide-dist/find/master) (search `whl`).

#### using numpy

```python
import micropip
await micropip.install('numpy')  
import numpy as np
a = np.random.rand(3,2)
b = np.random.rand(2,5)

print(a@b)
```

#### using matplotlib

```python
import micropip
await micropip.install('matplotlib')

import matplotlib.pyplot as plt

fig, ax = plt.subplots()             # Create a figure containing a single Axes.
ax.plot([1, 2, 3, 4], [1, 4, 2, 3])  # Plot some data on the Axes.
plt.show()                           # Show the figure.
```

#### using python local file

Having a # comment with `@mount('/local_path', '/path_to_mount')` will mount the locally file directly to the file system. Note this does not have safe guard, could blow up your memory if you try to load too many files as Pyodide reads all files in memory. See below example. Multiple `@mount` functions are allowed.

```python
# @mount('R:/test.txt', "/data/test.txt")
import os
# @mount('R:/local.csv', '/data/local.csv')
os.listdir('/data')
f = open("/data/test.txt", "r")
print(f.read())
```


### HTML&CSS

```html
<div><span class="h">Hello</span><span class="w">world</span></div>

<style>
.h {
  color: red;
}
.w {
  color: green;
}
</style>
```

### Any languages that support CORS

Here is the example to support Ruby.

```typescript
const url = 'https://api2.sololearn.com/v2/codeplayground/v2/compile';

const runCode = async (code: string, lang: 'cpp' | 'go' | 'c' | 'java' | 'cs' | 'swift' | 'rb') => {
  const header = {
    'User-Agent': 'Obsidian Code Emitter/0.1.0 (If this is not allowed, please let me know)',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US',
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    'headers': header,
    'body': JSON.stringify({
      'code': code,
      'codeId': null,
      'input': '',
      'language': lang
    }),
    'method': 'POST',
  });
  return (await res.json()) as {
    success: boolean,
    errors: string[],
    data: {
      sourceCode: number,
      status: number,
      errorCode: number,
      output: string,
      date: string,
      language: string,
      input: string,
    }
  };
};

const ruby_code = `
puts "Hello World12"
`;


console.log((await runCode(ruby_code, 'rb')).data.output);
```



## License

This plugin sandbox contains codes from [https://github.com/umijs/qiankun](https://github.com/umijs/qiankun/blob/master/src/sandbox/index.ts), which is licensed under

- MIT license (LICENSE-MIT or [http://opensource.org/licenses/MIT](http://opensource.org/licenses/MIT))

And other codes is licensed under

- GPL-3.0 license (LICENSE-GPL-3.0 or [https://opensource.org/licenses/GPL-3.0](https://opensource.org/licenses/GPL-3.0))
