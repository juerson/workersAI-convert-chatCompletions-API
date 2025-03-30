use serde_json::{ json, Map };
use std::fs;

fn main() {
    let models = fs::read_to_string("models.txt").expect("无法读取文件");

    let lines: Vec<&str> = models
        .trim()
        .split('\n')
        .map(|line| line.trim())
        .collect();

    let mut result = Map::new();

    for line in lines {
        if line.is_empty() {
            continue;
        }
        let parts: Vec<&str> = line.split('/').collect();
        let key = parts.last().unwrap();

        result.insert(key.to_string(), json!(line));
    }

    let json_result = json!(result);

    let pretty_json = serde_json::to_string_pretty(&json_result).expect("无法格式化 JSON");
    println!("{}", pretty_json);

    fs::write("models.json", pretty_json).expect("无法写入文件");
}
