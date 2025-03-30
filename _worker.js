// 配置信息
let enable_stream = false; // true:流式生成文本(该模式必须绑定 "Workers AI" )，false:非流式生成文本(等待文本生成完毕才显示，该模式必须配置 cf_account_array 参数)
let api_key = 'sk-xxxxxxxxxxxxxxxxx'; // 自己随意定义的（建议使用字母、数字），等同 OpenAI_Api_Key ，建议以"sk-"开头，方便区分
let cf_account_array = [{ account_id: 'xxxxxxxxxxxxxxxxx', token: 'xxxxxxxxxxxxxxxxx' }]; // 可以多配置几个账号，随机切换使用
// ——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————
let cf_account_map = new Map(); // 正在使用的account_id和token（映射）
// AI文本生成模型 https://developers.cloudflare.com/api/  ----->  左侧的"Workers AI Text Generation"
const TEXT_GENERATION_MODELS = {
  "deepseek-coder-6.7b-base-awq": "@hf/thebloke/deepseek-coder-6.7b-base-awq",
  "deepseek-coder-6.7b-instruct-awq": "@hf/thebloke/deepseek-coder-6.7b-instruct-awq",
  "deepseek-math-7b-instruct": "@cf/deepseek-ai/deepseek-math-7b-instruct",
  "deepseek-r1-distill-qwen-32b": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
  "discolm-german-7b-v1-awq": "@cf/thebloke/discolm-german-7b-v1-awq",
  "falcon-7b-instruct": "@cf/tiiuae/falcon-7b-instruct",
  "gemma-2b-it-lora": "@cf/google/gemma-2b-it-lora",
  "gemma-7b-it": "@hf/google/gemma-7b-it",
  "gemma-7b-it-lora": "@cf/google/gemma-7b-it-lora",
  "hermes-2-pro-mistral-7b": "@hf/nousresearch/hermes-2-pro-mistral-7b",
  "llama-2-13b-chat-awq": "@hf/thebloke/llama-2-13b-chat-awq",
  "llama-2-7b-chat-fp16": "@cf/meta/llama-2-7b-chat-fp16",
  "llama-2-7b-chat-hf-lora": "@cf/meta-llama/llama-2-7b-chat-hf-lora",
  "llama-2-7b-chat-int8": "@cf/meta/llama-2-7b-chat-int8",
  "llama-3-8b-instruct": "@cf/meta/llama-3-8b-instruct",
  "llama-3-8b-instruct-awq": "@cf/meta/llama-3-8b-instruct-awq",
  "llama-3.1-8b-instruct": "@cf/meta/llama-3.1-8b-instruct",
  "llama-3.1-8b-instruct-awq": "@cf/meta/llama-3.1-8b-instruct-awq",
  "llama-3.1-8b-instruct-fp8": "@cf/meta/llama-3.1-8b-instruct-fp8",
  "llama-3.2-11b-vision-instruct": "@cf/meta/llama-3.2-11b-vision-instruct",
  "llama-3.2-1b-instruct": "@cf/meta/llama-3.2-1b-instruct",
  "llama-3.2-3b-instruct": "@cf/meta/llama-3.2-3b-instruct",
  "llama-3.3-70b-instruct-fp8-fast": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "llama-guard-3-8b": "@cf/meta/llama-guard-3-8b",
  "llamaguard-7b-awq": "@hf/thebloke/llamaguard-7b-awq",
  "meta-llama-3-8b-instruct": "@hf/meta-llama/meta-llama-3-8b-instruct",
  "mistral-7b-instruct-v0.1": "@cf/mistral/mistral-7b-instruct-v0.1",
  "mistral-7b-instruct-v0.1-awq": "@hf/thebloke/mistral-7b-instruct-v0.1-awq",
  "mistral-7b-instruct-v0.2": "@hf/mistral/mistral-7b-instruct-v0.2",
  "mistral-7b-instruct-v0.2-lora": "@cf/mistral/mistral-7b-instruct-v0.2-lora",
  "neural-chat-7b-v3-1-awq": "@hf/thebloke/neural-chat-7b-v3-1-awq",
  "openchat-3.5-0106": "@cf/openchat/openchat-3.5-0106",
  "openhermes-2.5-mistral-7b-awq": "@hf/thebloke/openhermes-2.5-mistral-7b-awq",
  "phi-2": "@cf/microsoft/phi-2",
  "qwen1.5-0.5b-chat": "@cf/qwen/qwen1.5-0.5b-chat",
  "qwen1.5-1.8b-chat": "@cf/qwen/qwen1.5-1.8b-chat",
  "qwen1.5-14b-chat-awq": "@cf/qwen/qwen1.5-14b-chat-awq",
  "qwen1.5-7b-chat-awq": "@cf/qwen/qwen1.5-7b-chat-awq",
  "sqlcoder-7b-2": "@cf/defog/sqlcoder-7b-2",
  "starling-lm-7b-beta": "@hf/nexusflow/starling-lm-7b-beta",
  "tinyllama-1.1b-chat-v1.0": "@cf/tinyllama/tinyllama-1.1b-chat-v1.0",
  "una-cybertron-7b-v2-bf16": "@cf/fblgit/una-cybertron-7b-v2-bf16",
  "zephyr-7b-beta-awq": "@hf/thebloke/zephyr-7b-beta-awq"
};
const DEFAULT_MODEL = 'gemma-7b-it-lora'; // 默认模型，根据 TEXT_GENERATION_MODELS 的 key 键修改

// 主处理函数
var worker_default = {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return handleCORS();
		}

		// 加载环境变量的值到全局变量中(api_key, enable_stream, cf_account_map)
		if (env.API_KEY) api_key = env.API_KEY;
		if (env.STREAM === 'true' || env.STREAM === '1') enable_stream = true;
		if (env.STREAM === 'false' || env.STREAM === '0') enable_stream = false;
		if (env.ACCOUNT_ID && env.API_TOKEN) {
			cf_account_map.set('account_id', env.ACCOUNT_ID);
			cf_account_map.set('token', env.API_TOKEN);
		} else {
			const randomIndex = Math.floor(Math.random() * cf_account_array.length);
			cf_account_map.set('account_id', cf_account_array[randomIndex]['account_id']);
			cf_account_map.set('token', cf_account_array[randomIndex]['token']);
		}

		if (!isAuthorized(request)) {
			return new Response('Unauthorized', { status: 401 });
		}

		const url = new URL(request.url);
		if (url.pathname.endsWith('/v1/models')) {
			return handleModelsRequest();
		}

		if (request.method !== 'POST' || !url.pathname.endsWith('/v1/chat/completions')) {
			return new Response('Not Found', { status: 404 });
		}

		return handleChatCompletions(request, env);
	},
};

// 处理CORS预检请求
function handleCORS() {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
}

// 验证授权
function isAuthorized(request) {
	const authHeader = request.headers.get('Authorization');
	return authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === api_key;
}

// 处理模型列表请求
function handleModelsRequest() {
	const models = Object.keys(TEXT_GENERATION_MODELS).map((id) => ({ id, object: 'model' }));
	return new Response(JSON.stringify({ data: models, object: 'list' }), {
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}

// 处理聊天完成请求
async function handleChatCompletions(request, env) {
	try {
		// messages 是一个数组，每个元素都是一个对象，包含消息内容和角色信息；requestedModel是客户端中，选择的要使用的模型
		const { messages, model: requestedModel } = await request.json();

		// 获取最后一个用户消息（最新用户发送的消息）
		const userMessage = messages.findLast((msg) => msg.role === 'user')?.content;
		if (!userMessage) {
			return new Response(JSON.stringify({ error: '未找到用户消息' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
		}

		// 获取要使用的模型（如果客户端中选择的模型在 TEXT_GENERATION_MODELS 中不存在，则使用代码设置的 DEFAULT_MODEL ，找不到就使用 TEXT_GENERATION_MODELS 的第一个模型！）
		const FIRST_MODEL = Object.keys(TEXT_GENERATION_MODELS)[0];
		let model = TEXT_GENERATION_MODELS[requestedModel] || TEXT_GENERATION_MODELS[DEFAULT_MODEL] || FIRST_MODEL;

		if (enable_stream) {
			// 流式响应
			return handleStreamResponse(env, model, messages);
		} else {
			// 非流式响应
			return handleNonStreamResponse(model, messages);
		}
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Internal Server Error: ' + error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

// 处理流式响应
async function handleStreamResponse(env, model, messagesArray) {
	try {
		console.log(`流式响应，正在使用的模型: ${model}`);
		const responseContent = await env.AI.run(model, {
			messages: messagesArray,
			stream: true,
			// max_tokens: 2048, // 添加这个参数，有的模型无法使用，建议将它注释掉。
		});

		// 使用 ReadableStream 构造一个持续推送数据的流响应
		const stream = new ReadableStream({
			async start(controller) {
				const reader = responseContent.getReader();
				const decoder = new TextDecoder('utf-8');
				try {
					while (true) {
						const { value, done } = await reader.read();
						if (done) {
							controller.close();
							break;
						}
						if (value) {
							const chunk = decoder.decode(value, { stream: true });
							// 使用正则提取 response 字段的内容
							const matches = chunk.match(/"response":"(.*?)"/);
							if (matches && matches[1]) {
								// 替换为转义字符
								// const responseContent = matches[1].replace(/\\n/g, '\n').replace(/\\\\/g, '\\').replace(/\\t/g, '\t').replace(/\\r/g, '\r');
								const responseContent = unescapeString(matches[1]);

								// 将提取到的 response 内容推送到流中
								let result = `data: ${JSON.stringify({
									id: `chatcmpl-${Date.now()}`,
									object: 'chat.completion.chunk',
									created: Math.floor(Date.now() / 1000),
									model: model,
									choices: [{ delta: { content: responseContent }, index: 0, finish_reason: null }],
								})}\n\n`;
								controller.enqueue(new TextEncoder().encode(result));
							}
							// 如果检测到 "data: [DONE]" 则不再处理后续内容
							if (chunk.includes('data: [DONE]')) {
								controller.close();
								break;
							}
						}
					}
				} catch (error) {
					console.error('Error reading stream:', error);
					controller.error(error);
				} finally {
					reader.releaseLock();
				}
			},
		});
		console.log(`流式响应，返回的数据：${stream}`);
		// 返回一个流式响应
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		});
	} catch (error) {
		throw new Error('内容生成失败: ' + error.message);
	}
}

// 处理非流式响应
async function handleNonStreamResponse(model, messagesArray) {
	try {
		console.log(`非流式响应，正在使用的模型: ${model}`);

		const generatedContentString = await getGenerateContent(model, messagesArray);
		console.log(`非流式响应，正文内容: ${generatedContentString}`);

		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						`data: ${JSON.stringify({
							id: `chatcmpl-${Date.now()}`,
							object: 'chat.completion.chunk',
							created: Math.floor(Date.now() / 1000),
							model: model,
							choices: [{ delta: { content: generatedContentString }, index: 0, finish_reason: null }],
						})}\n\n`
					)
				);
				controller.enqueue(encoder.encode('data: [DONE]\n\n'));
				controller.close();
			},
		});
		console.log(`非流式响应，返回的数据：${stream}`);

		// 返回一个非流式响应
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		});
	} catch (error) {
		throw new Error('内容生成失败: ' + error.message);
	}
}

// 使用指定模型生成文本内容
async function getGenerateContent(model, prompt) {
	try {
		const jsonBody = {
			max_tokens: 2048,
			messages: prompt,
		};
		const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${cf_account_map.get('account_id')}/ai/run/${model}`;
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${cf_account_map.get('token')}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(jsonBody),
		});

		if (!response.ok) {
			throw new Error('Cloudflare API request failed: ' + response.status);
		}
		const jsonResponse = await response.json();
		return jsonResponse.result.response || '生成失败';
	} catch (error) {
		throw new Error('内容生成失败: ' + error.message);
	}
}

function unescapeString(str) {
	return str
		.replace(/\\\\/g, '\\') // 将 \\\\ 转换为 \\
		.replace(/\\'/g, "'") // 将 \\' 转换为 '
		.replace(/\\"/g, '"') // 将 \\" 转换为 "
		.replace(/\\n/g, '\n') // 将 \n 转换为换行符
		.replace(/\\t/g, '\t') // 将 \t 转换为制表符
		.replace(/\\r/g, '\r') // 将 \r 转换为回车符
		.replace(/\\b/g, '\b') // 将 \b 转换为退格符
		.replace(/\\f/g, '\f') // 将 \f 转换为换页符
		.replace(/\\v/g, '\v'); // 将 \v 转换为垂直制表符
}

export { worker_default as default };
