本Cloudflare Worker/Pages部署代码的功能，将 Workers AI 的**文本生成推理模型**的调用接口，转换为 OpenAI Chat Completion 接口，提供给 [NextChat](https://app.nextchat.dev/)、[Chatbox](https://web.chatboxai.app/) 、[ChatGPT-MJ](https://vercel.ddaiai.com/) 、[cherry-studio](https://github.com/kangfenmao/cherry-studio)等软件使用（支持修改自定义接口地址和自定义模型的软件）。

将`_worker.js`代码托管到Cloudflare的Workers或Pages后，按照下面内容操作。

## 一、添加或修改变量

修改代码的变量 `enable_stream`、`api_key`、`cf_account_array` 值，或者 Cloudflare 的`Workers和Pages`后台的参数。
#### 1.1 二选一，设置变量值
<details>
	<summary>点击查看要修改哪些代码</summary>
	<img src="images\代码中修改.png" />
</details>

<details>
	<summary>点击查看要设置什么变量</summary>
	<img src="images\变量和机密.png" />
</details>

#### 1.2 （必须）绑定Workers AI

<details>
	<summary>点击查看怎么绑定Workers AI</summary>
	<img src="images\绑定Workers AI资源.gif" />
</details>

#### 1.3 在Cloudflare中，设置变量

| 类型   | 名称       | 值                                        | 备注                                                         |
| ------ | ---------- | ----------------------------------------- | ------------------------------------------------------------ |
| 纯文本 | ACCOUNT_ID | n6pi2hclchld4ph789j508ah49s414ls          | 该值是您的Cloudflare Account ID                              |
| 纯文本 | API_TOKEN  | Fqdt3fR0hjF7439UL-jVr3q1oW7I2e3_Goan80Rx  | 需要您在Cloudflare后台创建 [api-kokens](https://dash.cloudflare.com/profile/api-tokens) |
| 纯文本 | API_KEY    | sk-x6y45fl59q07r113e9k729345y9wic6b29a20b | 类似OpenAI Api Key，不过这里自己取名                         |
| 纯文本 | STREAM     | true                                      | 默认不设置，由代码中的变量enable_stream确定；流式输出设置为1/true，非流式输出设置为0/false |

注意：表中的ACCOUNT_ID、API_TOKEN、API_KEY值用于举例的，实际使用不要照抄。

## 二、使用示例

```
https://text-generation.<用户名>.workers.dev
```

一些软件/插件要输入完整的URL，如下：

```
https://text-generation.<用户名>.workers.dev/v1/chat/completions
```

#### 2.1 [NextChat](https://app.nextchat.dev/)：

下载地址：[Link](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web/releases)

<details>
	<summary>点击查看</summary>
	<img src="images\NextChat中，修改接口地址.png" style="zoom: 50%;" />
</details>

#### 2.2 [ChatGPT-MJ](https://vercel.ddaiai.com/) ：

下载地址：[Link](https://github.com/Dooy/chatgpt-web-midjourney-proxy/releases)

<details>
	<summary>点击查看</summary>
	<img src="images\ChatGPT MJ中，修改接口地址.gif" style="zoom:50%;" />
</details>

#### 2.3 [Chatbox](https://web.chatboxai.app/) ：

下载地址：[Link](https://github.com/Bin-Huang/chatbox/releases)

<details>
	<summary>点击查看</summary>
	<img src="images\ChatBox中，修改接口地址.gif" style="zoom:50%;" />
</details>

#### 2.4 cherry-studio

下载地址：[Link](https://github.com/kangfenmao/cherry-studio)

<details>
	<summary>点击查看</summary>
	<img src="images\cherry-studio中配置.gif" />
	<img src="images\cherry-studio中聊天.gif" style="zoom:50%;" />
</details>


## 三、文本生成模型对照表

| Model Name                               | Model Identifier                            |
|------------------------------------------|--------------------------------------------|
| deepseek-math-7b-instruct                | @cf/deepseek-ai/deepseek-math-7b-instruct |
| sqlcoder-7b-2                            | @cf/defog/sqlcoder-7b-2                    |
| una-cybertron-7b-v2-bf16                 | @cf/fblgit/una-cybertron-7b-v2-bf16       |
| gemma-2b-it-lora                        | @cf/google/gemma-2b-it-lora                |
| gemma-7b-it-lora                        | @cf/google/gemma-7b-it-lora                |
| llama-2-7b-chat-hf-lora                 | @cf/meta-llama/llama-2-7b-chat-hf-lora    |
| llama-2-7b-chat-fp16                     | @cf/meta/llama-2-7b-chat-fp16              |
| llama-2-7b-chat-int8                     | @cf/meta/llama-2-7b-chat-int8              |
| llama-3-8b-instruct                      | @cf/meta/llama-3-8b-instruct               |
| llama-3-8b-instruct-awq                  | @cf/meta/llama-3-8b-instruct-awq           |
| llama-3.1-70b-instruct                   | @cf/meta/llama-3.1-70b-instruct            |
| llama-3.1-70b-instruct-preview           | @cf/meta/llama-3.1-70b-instruct-preview    |
| llama-3.1-70b-preview                    | @cf/meta/llama-3.1-70b-preview             |
| llama-3.1-8b-instruct                    | @cf/meta/llama-3.1-8b-instruct             |
| llama-3.1-8b-instruct-awq                | @cf/meta/llama-3.1-8b-instruct-awq         |
| llama-3.1-8b-instruct-fast               | @cf/meta/llama-3.1-8b-instruct-fast        |
| llama-3.1-8b-instruct-fp8                | @cf/meta/llama-3.1-8b-instruct-fp8         |
| llama-3.1-8b-preview                     | @cf/meta/llama-3.1-8b-preview              |
| llama-3.2-11b-vision-instruct            | @cf/meta/llama-3.2-11b-vision-instruct     |
| llama-3.2-1b-instruct                    | @cf/meta/llama-3.2-1b-instruct             |
| llama-3.2-3b-instruct                    | @cf/meta/llama-3.2-3b-instruct             |
| phi-2                                    | @cf/microsoft/phi-2                         |
| mistral-7b-instruct-v0.1                 | @cf/mistral/mistral-7b-instruct-v0.1      |
| mistral-7b-instruct-v0.2-lora            | @cf/mistral/mistral-7b-instruct-v0.2-lora |
| openchat-3.5-0106                        | @cf/openchat/openchat-3.5-0106             |
| qwen1.5-0.5b-chat                        | @cf/qwen/qwen1.5-0.5b-chat                 |
| qwen1.5-1.8b-chat                        | @cf/qwen/qwen1.5-1.8b-chat                 |
| qwen1.5-14b-chat-awq                     | @cf/qwen/qwen1.5-14b-chat-awq              |
| qwen1.5-7b-chat-awq                      | @cf/qwen/qwen1.5-7b-chat-awq               |
| discolm-german-7b-v1-awq                 | @cf/thebloke/discolm-german-7b-v1-awq      |
| falcon-7b-instruct                       | @cf/tiiuae/falcon-7b-instruct              |
| tinyllama-1.1b-chat-v1.0                 | @cf/tinyllama/tinyllama-1.1b-chat-v1.0    |
| gemma-7b-it                              | @hf/google/gemma-7b-it                     |
| meta-llama-3-8b-instruct                 | @hf/meta-llama/meta-llama-3-8b-instruct    |
| mistral-7b-instruct-v0.2                 | @hf/mistral/mistral-7b-instruct-v0.2      |
| mistral-7b-instruct-v0.2-ai              | @hf/mistralai/mistral-7b-instruct-v0.2    |
| starling-lm-7b-beta                      | @hf/nexusflow/starling-lm-7b-beta          |
| hermes-2-pro-mistral-7b                  | @hf/nousresearch/hermes-2-pro-mistral-7b   |
| deepseek-coder-6.7b-base-awq             | @hf/thebloke/deepseek-coder-6.7b-base-awq  |
| deepseek-coder-6.7b-instruct-awq         | @hf/thebloke/deepseek-coder-6.7b-instruct-awq |
| llama-2-13b-chat-awq                     | @hf/thebloke/llama-2-13b-chat-awq          |
| llamaguard-7b-awq                        | @hf/thebloke/llamaguard-7b-awq             |
| mistral-7b-instruct-v0.1-awq             | @hf/thebloke/mistral-7b-instruct-v0.1-awq  |
| neural-chat-7b-v3-1-awq                  | @hf/thebloke/neural-chat-7b-v3-1-awq       |
| openhermes-2.5-mistral-7b-awq            | @hf/thebloke/openhermes-2.5-mistral-7b-awq |
| zephyr-7b-beta-awq                       | @hf/thebloke/zephyr-7b-beta-awq             |

表格数据来源：[Link](https://developers.cloudflare.com/api/)；也可以查看Workers AI的Text Generation模型：[Link](https://developers.cloudflare.com/workers-ai/models/)
**注意：**

**1、这里的罗列的所有模型，并不是都能使用，特别是第一次使用时，无法使用，怀疑是否能代码有问题，我也遇到，但是换成其他模型时，就能使用了。**

**2、如果Cloudflare推出新的Text Generation模型，在这个表格找不到，就需要在代码中手动添加。**

**3、普通用户只需要表格左侧的模型名称。**

<details>
	<summary>点击查看</summary>
	<img src="images\TextGenerationModels.gif" style="zoom:50%;" />
</details>

## 四、问题

1、一些可以自定义**OpenAI接口地址**的插件或软件，修改成自己部署的 Worker/Pages 地址，以及输入正确的 API KEY 密钥后，依然无法使用（更换其他软件能使用）。比如：[沉浸式翻译](https://immersivetranslate.com/) 无法使用。

2、生成的文本，设置为**流式输出**，凡是文本含有**转义字符**的情况，可能无法准确处理，可能出现乱码（过度删除转义字符、错误保留转义字符的反斜杆），**建议使用非流式输出**。

3、注意：代码中TEXT_GENERATION_MODELS，设置的**文本生成模型**可能会失效，同时，在 [NextChat](https://app.nextchat.dev/)、[Chatbox](https://web.chatboxai.app/) 、[ChatGPT-MJ](https://vercel.ddaiai.com/) 软件中，设置自定义模型时，一定要按照TEXT_GENERATION_MODELS的key键一字不差地写，如果key键对应的@某某模型被Cloudflare限用或删除，依然发送消息会报错，无法获取生成的文本内容。

