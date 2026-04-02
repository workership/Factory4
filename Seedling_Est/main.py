import os
import kagglehub
import pandas as pd
import xgboost as xgb
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
import joblib

import json


def predict_from_json(input_json,model):
    """
    输入接口：接受 JSON 字符串
    输出接口：返回 JSON 字符串
    """
    # 1. 解析输入数据
    data = json.loads(input_json)


    input_df = pd.DataFrame([{
        'Tair': data.get('currentTemp'),
        'Rhair': data.get('currentHumidity'),
        'CO2air': data.get('currentCO2'),
        'Tot_PAR': data.get('currentLight'),

    }])

    # 3. 模型预测
    prediction = model.predict(input_df)[0]

    # 4. 构造输出 JSON (匹配你要求的格式)
    output_data = {
        "targetTemp": float(prediction[0]),
        "humidityDeficit": float(prediction[1]),
        "co2Set": float(prediction[2]),
        "lightSet": float(prediction[3])
    }

    return json.dumps(output_data, indent=4)


# 1. 下载数据集并获取路径
path = kagglehub.dataset_download(handle="piantic/autonomous-greenhouse-challengeagc-2nd-2019",output_dir="Seedling_Est/")
print("数据集存储路径:", path)


# 定位到你指定的具体文件
climate_path = os.path.join(path, 'Automatoes', 'GreenhouseClimate.csv')
df = pd.read_csv(climate_path)

# 2. 设定特征 (X) 与 目标策略 (y)
features = ['Tair', 'Rhair', 'CO2air', 'Tot_PAR']
targets = ['t_heat_sp', 'dx_sp', 'co2_sp', 'assim_sp']

# 3. 数据清洗：解决 Object/Str 类型报错
# 强制将选定列转换为 float 数值型，无法转换的字符会变成 NaN
for col in features + targets:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# 删除带有 NaN 的行，确保 XGBoost 多输出回归正常运行
df_clean = df.dropna(subset=features + targets).copy()

# 4. 寒地水稻育秧场景参数偏移
# 水稻育秧对温度要求高于番茄，对加热目标设定值增加 5°C
df_clean['t_heat_sp'] = df_clean['t_heat_sp'] + 5.0

# 5. 提取数据并划分训练集/测试集
X = df_clean[features]
y = df_clean[targets]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 6. 构建与训练模型
# 使用 MultiOutputRegressor 包装 XGBRegressor 处理多个 y 变量
model = MultiOutputRegressor(xgb.XGBRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    objective='reg:squarederror'
))

print("正在训练模型...")
model.fit(X_train, y_train)
print("模型训练完成。\n")



# 保存模型
joblib.dump(model, 'rice_model.pkl')
print("模型已保存为 rice_model.pkl")

# 7. 测试单条数据的调节策略输出
sample_input = X_test.head(2)
predicted_strategy = model.predict(sample_input)



# --- 测试代码 ---
test_input = """
{
    "currentTemp": 18.6,
    "currentHumidity": 87.8,
    "currentCO2": 620.0,
    "currentLight": 0.0,
    "hour": 2
}
"""


result_json = predict_from_json(test_input,model)
print("【模型决策输出】:", result_json)