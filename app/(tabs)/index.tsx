import { supabase } from "@/utils/supabase";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";

type Task = {
	id: string;
	title: string;
	is_done?: boolean;
};

type TaskForm = {
	title: string;
	is_done?: boolean;
};

export default function HomeScreen() {
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	// fetch tasks
	const [tasks, setTasks] = useState<Task[]>([]);
	const getTasks = async () => {
		try {
			const { data: tasks, error } = await supabase.from("tasks").select();
			if (error) throw error.message;
			if (tasks && tasks.length > 0) setTasks(tasks);
		} catch (error) {
			throw error;
		}
	};
	useEffect(() => {
		getTasks();
	}, []);
	const totalTasks: number = tasks.length;
	const doneTasks: number = tasks.filter((t: Task) => t.is_done).length;

	// create task
	const [form, setForm] = useState<TaskForm>({
		title: "",
    is_done: false,
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const updateForm = (key: keyof TaskForm, value: string) => {
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));
	};
	const handleCreateTask = async () => {
		if (!form.title.trim()) return;
		try {
			setIsLoading(true);
			const { error } = await supabase.from("tasks").insert({
				...form,
				is_done: false,
			});
			if (error) throw error.message;
			setForm({ title: "" });
			setIsModalVisible(false);
			getTasks();
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

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
			{tasks && tasks.length > 0 ? (
				<FlatList<Task>
					data={tasks}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ paddingBottom: 100 }}
					renderItem={({ item }) => (
						<View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between">
							<Text className={`text-base ${item.is_done ? "line-through text-neutral-400" : ""}`}>
								{item.title}
							</Text>
							{item.is_done && <Text className="text-green-600 font-semibold">✓</Text>}
						</View>
					)}
				/>
			) : (
				<View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between">
					<Text className="text-base">No tasks</Text>
				</View>
			)}

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
							value={form.title}
							onChangeText={(value) => updateForm("title", value)}
						/>
						<View className="flex-row gap-3">
							<Pressable
								onPress={() => setIsModalVisible(false)}
								className="flex-1 py-3 rounded-xl bg-neutral-200 items-center">
								<Text>Cancel</Text>
							</Pressable>
							<Pressable
								className="flex-1 py-3 rounded-xl bg-black items-center"
								onPress={handleCreateTask}
								disabled={isLoading}>
								<Text className="text-white font-semibold">Save</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
