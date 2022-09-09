import { statSync } from "fs";
import { Compiler } from "webpack";
import { formatBytes } from "./helpers";

export interface WebpackDontRepackPluginOptions {
  log?: boolean;
}

class WebpackDontRepackPlugin {
  private processed = new Set<string>();
  private pathCache = new Map<string, string>();
  private options: WebpackDontRepackPluginOptions;

  constructor(options: WebpackDontRepackPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    this.applyDontRepack(compiler);
    if (this.options.log !== false) {
      this.applyLog(compiler);
    }
  }

  private applyDontRepack(compiler: Compiler) {
    compiler.resolverFactory.hooks.resolver
      .for("normal")
      .tap("name", (resolver) => {
        resolver.hooks.result.tap(this.constructor.name, (result) => {
          const { descriptionFileData, path, relativePath } = result;
          // @ts-ignore
          const { name, version } = descriptionFileData; // package.json 信息
          const key = name + version; // 名称 + 版本作为模块唯一标志

          if (key && path) {
            const id = key + relativePath; // key + 相对路径作为模块唯一索引, 因为还会存在 require(name/...relativePath) 的引用
            const cachePath = this.pathCache.get(id);

            if (cachePath === undefined) {
              this.pathCache.set(id, path);
            } else if (path !== cachePath) {
              this.processed.add(path);
              result.path = cachePath;
            }
          }

          return result;
        });
      });
  }

  private applyLog(compiler: Compiler) {
    const logger = compiler.getInfrastructureLogger(this.constructor.name);

    compiler.hooks.done.tap(this.constructor.name, () => {
      const totalSize = Array.from(this.processed).reduce((pre, cur) => {
        return pre + statSync(cur).size;
      }, 0);

      logger.info(
        `${this.constructor.name} has reduced ${
          this.processed.size
        } duplicate modules, Total file size: ${formatBytes(
          totalSize
        )}(Estimated value, may not be accurate):\n${Array.from(
          this.processed
        ).join("\n")}`
      );
    });
  }
}

module.exports = WebpackDontRepackPlugin;
