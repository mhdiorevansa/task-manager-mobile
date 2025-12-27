import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";

type Task = {
	id: string;
	title: string;
	done: boolean;
};

const tasks: Task[] = [
	{ id: "1", title: "Task 1", done: false },
	{ id: "2", title: "Task 2", done: true },
	{ id: "3", title: "Task 3", done: false },
];

export default function HomeScreen() {
	const totalTasks: number = tasks.length;
	const doneTasks: number = tasks.filter((t) => t.done).length;
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	return (
		<View className="flex-1 bg-neutral-900 px-6 pt-14">
			{/* header */}
			<View className="mb-6">
				<Text className="text-2xl font-bold text-white">My Tasks</Text>
				<Text className="text-white">{new Date().toDateString()}</Text>
			</View>

			{/* stats */}
			<View className="flex-row gap-3 mb-6">
				<View className="flex-1 bg-white rounded-2xl p-4">
					<Text className="text-neutral-500">Total Tasks</Text>
					<Text className="text-2xl font-bold">{totalTasks}</Text>
				</View>

				<View className="flex-1 bg-white rounded-2xl p-4">
					<Text className="text-neutral-500">Done tasks</Text>
					<Text className="text-2xl font-bold text-green-600">{doneTasks}</Text>
				</View>
			</View>

			{/* task list */}
			<FlatList<Task>
				data={tasks}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ paddingBottom: 100 }}
				renderItem={({ item }) => (
					<View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between">
						<Text className={`text-base ${item.done ? "line-through text-neutral-400" : ""}`}>
							{item.title}
						</Text>
						{item.done && <Text className="text-green-600 font-semibold">✓</Text>}
					</View>
				)}
			/>

			{/* floating button */}
			<Pressable
				onPress={() => setIsModalVisible(true)}
				className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center">
				<Feather name="plus" size={26} color="white" />
			</Pressable>

			{/* modal */}
			<Modal visible={isModalVisible} animationType="slide" transparent>
				<View className="flex-1 bg-neutral-900/40 justify-end">
					<View className="bg-white rounded-t-3xl p-6">
						<Text className="text-xl font-bold mb-4">New Task</Text>
						<TextInput
							placeholder="Task title..."
							className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
						/>
						<View className="flex-row gap-3">
							<Pressable
								onPress={() => setIsModalVisible(false)}
								className="flex-1 py-3 rounded-xl bg-neutral-200 items-center">
								<Text>Cancel</Text>
							</Pressable>
							<Pressable className="flex-1 py-3 rounded-xl bg-black items-center">
								<Text className="text-white font-semibold">Save</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
