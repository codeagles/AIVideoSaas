/**
 * CompactGenerator Component
 *
 * 紧凑形态的生成器组件，用于工具页面左侧的 GeneratorPanel
 * 基于 VideoGeneratorCore，仅显示核心控件
 *
 * @module compact-generator
 */

"use client";

import * as React from "react";
import {
  ChevronDown,
  Send,
  Loader2,
  Clock,
  X,
  Plus,
  Volume2,
  Settings,
} from "lucide-react";
import { cn } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import type { OutputNumberOption } from "./types";
import {
  VideoGeneratorCore,
  useVideoGeneratorCore,
  type VideoGeneratorCoreConfig,
} from "./video-generator-core";

// ============================================================================
// Types
// ============================================================================

export interface CompactGeneratorProps {
  // 配置
  config: VideoGeneratorCoreConfig;

  // 用户状态
  isPro?: boolean;
  isLoading?: boolean;
  disabled?: boolean;

  // 积分
  estimatedCredits?: number;

  // 回调
  onSubmit?: (data: any) => void;
  onChange?: (data: any) => void;
  onModelChange?: (modelId: string, type: string) => void;
  onPromptChange?: (prompt: string) => void;
  onImageUpload?: (files: File[], slot: string) => void;
  onImageRemove?: (slot: string) => void;
  onProFeatureClick?: (feature: string) => void;

  // 多语言
  texts?: {
    placeholder?: string;
    credits?: string;
    settings?: string;
    aspectRatio?: string;
    duration?: string;
    resolution?: string;
    outputNumber?: string;
    generateAudio?: string;
    generateAudioDesc?: string;
    generate?: string;
    generating?: string;
  };

  // 样式
  className?: string;
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * CompactRenderer - 紧凑模式的实际渲染组件
 */
function CompactRenderer() {
  const {
    config,
    features,
    texts,
    state,
    computed,
    validation,
    actions,
    handlers,
    refs,
    calculatedCredits,
    isLoading,
    isPro,
  } = useVideoGeneratorCore();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // 检查是否显示类型切换
  const showTypeSwitch = features.showGenerationTypeSwitch !== false &&
    config.videoModels.length > 0 &&
    config.imageModels.length > 0;

  // 检查是否显示模式选择器
  const showModeSelector = features.showModeSelector !== false &&
    (state.generationType === "video" ? config.videoModes : config.imageModes).length > 0;

  // 检查是否显示图片上传
  const showImageUpload = features.showImageUpload !== false;

  // 检查是否显示提示词输入
  const showPromptInput = features.showPromptInput !== false;

  // 检查是否显示设置
  const showSettings = features.showSettings !== false;

  // 检查是否显示高级设置
  const showAdvancedSettings = features.showAdvancedSettings !== false;

  // 辅助函数：检查图标是否为 URL
  const isIconUrl = (icon: string) => {
    return icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/");
  };

  // 辅助函数：获取模型图标
  const getModelIcon = (model: any) => {
    return model.icon ?? model.name.charAt(0).toUpperCase();
  };

  // 辅助函数：获取模型颜色
  const getModelColor = (model: any) => {
    return model.color ?? "#71717a";
  };

  // 渲染模型图标
  const renderModelIcon = (model: any) => {
    const icon = getModelIcon(model);
    const color = getModelColor(model);

    if (isIconUrl(icon)) {
      return (
        <img
          src={icon}
          alt={model.name}
          className="w-4 h-4 rounded object-cover"
        />
      );
    }

    return (
      <span
        className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold"
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {icon}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 隐藏的文件输入 */}
      <input
        ref={refs.fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlers.handleImageUpload}
        className="hidden"
      />

      {/* 输入区域 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
        {/* 上传和输入行 */}
        <div className="flex gap-2">
          {/* 图片上传区域 */}
          {showImageUpload && computed.uploadSlots.map((slot) => {
            const image = handlers.getImageForSlot(slot.id);
            return (
              <div key={slot.id} className="flex flex-col items-center gap-1">
                {image ? (
                  <div className="relative group">
                    <button
                      onClick={() => handlers.handleRemoveImage(slot.id)}
                      className="absolute -top-1 -right-1 z-10 p-0.5 rounded-full bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                    <div className="w-10 h-12 rounded-lg p-0.5 bg-zinc-800 border border-zinc-700">
                      <div className="relative w-full h-full rounded overflow-hidden">
                        <img
                          src={image.preview}
                          alt={slot.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handlers.handleUploadClick(slot.id)}
                    className="w-10 h-12 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 transition-colors flex items-center justify-center text-zinc-500 hover:text-zinc-400"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}

          {/* 提示词输入 */}
          {showPromptInput && (
            <div className="flex-1 min-h-[48px]">
              <textarea
                value={state.prompt}
                onChange={(e) => {
                  actions.setPrompt(e.target.value);
                }}
                onKeyDown={handlers.handleKeyDown}
                placeholder={texts.placeholder ?? texts.videoPlaceholder}
                disabled={isLoading}
                className={cn(
                  "w-full h-full min-h-[48px] max-h-[120px] bg-transparent placeholder:text-zinc-500 resize-none focus:outline-none text-sm leading-relaxed",
                  validation.promptError ? "text-red-400" : "text-zinc-100",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                rows={2}
              />
            </div>
          )}
        </div>

        {/* 字符计数和错误 */}
        {(validation.showCharCount || validation.promptError) && (
          <div
            className={cn(
              "text-xs mt-1 text-right",
              validation.promptError ? "text-red-400" : "text-zinc-500"
            )}
          >
            {validation.charCount}
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 模型选择器 */}
        {features.showModelSelector !== false && computed.currentModel && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-xs text-zinc-300">
                {renderModelIcon(computed.currentModel)}
                <span className="max-w-[80px] truncate">{computed.currentModel.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800 w-64 max-h-[320px] overflow-y-auto">
              <DropdownMenuLabel className="text-zinc-400 text-xs">
                {state.generationType === "video" ? texts.videoModels : texts.imageModels}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              {computed.availableModels.map((model: any) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => {
                    if (state.generationType === "video") {
                      actions.setVideoModel(model);
                    } else {
                      actions.setImageModel(model);
                    }
                  }}
                  className="text-zinc-300 hover:bg-zinc-800 flex flex-col items-start py-2"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {renderModelIcon(model)}
                      <span className="text-sm">{model.name}</span>
                    </div>
                    {computed.currentModel?.id === model.id && (
                      <div className="w-1 h-1 rounded-full bg-green-500" />
                    )}
                  </div>
                  {model.description && (
                    <div className="text-[10px] text-zinc-500 mt-0.5 ml-6">{model.description}</div>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* 快速设置按钮 */}
        {showSettings && (
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-xs text-zinc-400">
                <Settings className="w-3.5 h-3.5" />
                <span>{texts.settings ?? "Settings"}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-zinc-900 border-zinc-800 p-3" align="start">
              {/* 宽高比 */}
              <div className="mb-3">
                <Label className="text-xs text-zinc-400 mb-1.5 block">{texts.aspectRatio}</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {computed.currentAspectRatio &&
                    (state.generationType === "video"
                      ? computed.effectiveVideoAspectRatios
                      : computed.effectiveImageAspectRatios
                    ).map((ratio: string) => (
                      <button
                        key={ratio}
                        onClick={() => handlers.handleAspectRatioChange(ratio)}
                        className={cn(
                          "px-2 py-1.5 rounded text-xs transition-colors",
                          computed.currentAspectRatio === ratio
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        )}
                      >
                        {ratio}
                      </button>
                    ))}
                </div>
              </div>

              {/* 时长（仅视频） */}
              {state.generationType === "video" && computed.showDurationControl && (
                <div className="mb-3">
                  <Label className="text-xs text-zinc-400 mb-1.5 block">{texts.duration}</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {computed.effectiveDurations.map((d: string) => (
                      <button
                        key={d}
                        onClick={() => actions.setDuration(d)}
                        className={cn(
                          "px-2 py-1.5 rounded text-xs transition-colors",
                          state.duration === d
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 分辨率（仅视频） */}
              {state.generationType === "video" && computed.showResolutionControl && (
                <div>
                  <Label className="text-xs text-zinc-400 mb-1.5 block">{texts.resolution}</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {computed.effectiveResolutions.map((r: string) => (
                      <button
                        key={r}
                        onClick={() => actions.setResolution(r)}
                        className={cn(
                          "px-2 py-1.5 rounded text-xs transition-colors",
                          state.resolution === r
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        )}

        {/* 生成按钮 */}
        <button
          onClick={handlers.handleSubmit}
          disabled={!validation.canSubmit}
          className={cn(
            "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            validation.canSubmit
              ? "bg-white text-black hover:bg-zinc-200"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              {texts.generating ?? "Generating..."}
            </>
          ) : (
            <>
              <Send className="w-3 h-3" />
              {texts.generate ?? "Generate"}
            </>
          )}
          <span className="text-zinc-500">•</span>
          <span>{calculatedCredits} {texts.credits}</span>
        </button>
      </div>

      {/* 高级设置（仅显示需要时） */}
      {showAdvancedSettings && (computed.effectiveVideoOutputNumbers.length > 1 || computed.modelSupportsAudio) && (
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
          {/* 输出数量 */}
          {computed.effectiveVideoOutputNumbers.length > 1 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-zinc-400">{texts.outputNumber}</Label>
              <div className="flex gap-1">
                {computed.effectiveVideoOutputNumbers.map((option: OutputNumberOption) => (
                  <button
                    key={option.value}
                    onClick={() => handlers.handleOutputNumberChange(option)}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs transition-colors",
                      computed.currentOutputNumber === option.value
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
                      option.isPro && !isPro && "opacity-70"
                    )}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 生成音频（仅视频且模型支持时） */}
          {computed.modelSupportsAudio && (
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
              <Label className="text-xs text-zinc-300">{texts.generateAudio ?? "Audio"}</Label>
              <Switch
                checked={state.generateAudio}
                onCheckedChange={actions.setGenerateAudio}
                className="scale-75"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CompactGenerator Component
// ============================================================================

/**
 * CompactGenerator - 紧凑形态的生成器组件
 *
 * 用于工具页面左侧的 GeneratorPanel
 *
 * @example
 * ```tsx
 * <CompactGenerator
 *   config={toolPageConfig.generator}
 *   isPro={user.isPro}
 *   isLoading={isGenerating}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export function CompactGenerator({
  config,
  isPro = false,
  isLoading = false,
  disabled = false,
  estimatedCredits,
  onSubmit,
  onChange,
  onModelChange,
  onPromptChange,
  onImageUpload,
  onImageRemove,
  onProFeatureClick,
  texts,
  className,
}: CompactGeneratorProps) {
  return (
    <VideoGeneratorCore
      config={config}
      uiMode="compact"
      features={{
        showGenerationTypeSwitch: false, // 紧凑模式通常不需要类型切换
        showModeSelector: true,
        showModelSelector: true,
        showImageUpload: true,
        showPromptInput: true,
        showSettings: true,
        showAdvancedSettings: true,
        showPromptSuggestions: false,
      }}
      isPro={isPro}
      isLoading={isLoading}
      disabled={disabled}
      estimatedCredits={estimatedCredits}
      onSubmit={onSubmit}
      onChange={onChange}
      onModelChange={onModelChange}
      onPromptChange={onPromptChange}
      onImageUpload={onImageUpload}
      onImageRemove={onImageRemove}
      onProFeatureClick={onProFeatureClick}
      texts={texts}
      className={className}
    >
      <CompactRenderer />
    </VideoGeneratorCore>
  );
}

export default CompactGenerator;
