import urlImport from '../../lib/url_import';
import type { Backend, Stdio } from '../';
import type { loadPyodide } from 'pyodide/pyodide';
import type { PyodideInterface } from 'pyodide';
import fs from 'fs';
import path from 'path';

if (typeof process !== 'undefined' && typeof process.browser === 'undefined') {
  process.browser = true;
}

const default_cdn = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';
const mountRegex = /#\s*@mount\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/;

const setMplTarget = (target?: HTMLElement) => {
  if (target) {
    document['pyodideMplTarget'] = target;
  } else {
    delete document['pyodideMplTarget'];
  }
}

const mountLine = async (line: string, engine: PyodideInterface) => {
  const match = line.match(mountRegex);
  if (!match) {
    return;
  }

  const localPath = match[1];  // Extracted local path
  const virtualPath = match[2]; // Extracted virtual path

  try {
    // Create the virtual directory structure in VFS using pyodide.FS.mkdir
    const virtualPathDir = path.dirname(virtualPath);
    engine.FS.lookupPath(virtualPathDir, { follow: true });
  } catch (error) {
    if (error.errno !== 44) {
      console.error('Error creating virtual path or file:', error);
      throw error;
    }
    // If the path does not exist, FS.lookupPath throws an error with errno === 44 (ENOENT).
    engine.FS.mkdir(path.dirname(virtualPath));
  } 
  // Create a file and write content using pyodide.FS.writeFile
  // 'R:/test.txt'
  const data = await fs.promises.readFile(localPath, 'utf8');
  engine.FS.writeFile(virtualPath, data);

  console.log(`File created: ${virtualPath}`);
}

const setMountingPoint = async (code: string, engine: PyodideInterface) => {
  const lines = code.split('\n');
  // Create an array of promises for each line
  const promises = lines.map((line) => mountLine(line, engine));

  // Wait for all the promises to resolve
  return await Promise.all(promises).then(
    () => {
      // https://pyodide.org/en/stable/usage/file-system.html#synchronizing-changes-to-native-file-system
      return engine.FS.syncfs(false, () => {
        console.log('sync')
      });
    }
  );

}

let cache: { cdn: string, backend: Backend } | null = null;

export default (function(props?: { cdn: string }) {
  const cdn = props?.cdn ?? default_cdn;

  if (cache?.cdn === cdn) {
    return cache.backend;
  }

  let engine: PyodideInterface | null = null;
  let stdio: Stdio | null = null;
  let load: (() => Promise<void>) | null = null;
  const backend: Backend = async (code, output) => {
    if (!engine) {
      await load();
    }
    stdio = output;
    try {
      setMplTarget(output.viewEl);
      await setMountingPoint(code, engine).then(() => {
        return engine.runPythonAsync(code);
      });
    } catch (e) {
      output.stderr(e);
    } finally {
      setMplTarget(undefined);
    }
  };
  backend.loading = true;
  load = async () => {
    const loader = await urlImport<typeof loadPyodide>(
      `${cdn}pyodide.js`,
      () => ( window.loadPyodide )
    );
    engine = await loader({
      indexURL: cdn,
      stdout: (s) => stdio?.stdout(s),
      stderr:(s) => stdio?.stderr(s)
    });
    await engine.loadPackage('micropip');
    console.log('python loaded.');
    backend.loading = false;
  };

  cache = {
    cdn,
    backend
  };
  
  return backend;
})();