/**
 * 工具页面配置导出
 *
 * 提供统一的配置访问接口，支持按路由获取配置
 */

import type { ToolPageConfig, ToolLandingConfig, GeneratorConfig, PageSEOConfig } from "./types";
import { imageToVideoConfig } from "./image-to-video.config";
import { textToVideoConfig } from "./text-to-video.config";
import { referenceToVideoConfig } from "./reference-to-video.config";
import { adaptToolPageConfigToGeneratorConfig } from "./adapter";

// Export types
export type { ToolPageConfig, ToolLandingConfig, GeneratorConfig, PageSEOConfig } from "./types";

// Export configs
export { imageToVideoConfig } from "./image-to-video.config";
export { textToVideoConfig } from "./text-to-video.config";
export { referenceToVideoConfig } from "./reference-to-video.config";

// Export adapter
export { adaptToolPageConfigToGeneratorConfig } from "./adapter";

// ============================================================================
// 路由到配置的映射
// ============================================================================

const toolPageConfigs = {
  "image-to-video": imageToVideoConfig,
  "text-to-video": textToVideoConfig,
  "reference-to-video": referenceToVideoConfig,
} as const;

export type ToolPageRoute = keyof typeof toolPageConfigs;

/**
 * 根据路由获取工具页面配置
 *
 * @param route - 工具页面路由
 * @returns 工具页面配置，如果不存在则抛出错误
 *
 * @example
 * ```ts
 * const config = getToolPageConfig("image-to-video");
 * console.log(config.seo.title);
 * ```
 */
export function getToolPageConfig(route: ToolPageRoute): ToolPageConfig {
  const config = toolPageConfigs[route];
  if (!config) {
    throw new Error(`Unknown tool route: ${route}`);
  }
  return config;
}

/**
 * 获取所有工具页面路由
 */
export function getToolPageRoutes(): ToolPageRoute[] {
  return Object.keys(toolPageConfigs) as ToolPageRoute[];
}

/**
 * 检查路由是否为有效的工具页面
 */
export function isValidToolRoute(route: string): route is ToolPageRoute {
  return route in toolPageConfigs;
}
