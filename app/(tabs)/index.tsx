import { supabase } from "@/utils/supabase";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	Switch,
	Text,
	TextInput,
	View,
} from "react-native";

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
	const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
	const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false);

	// fetch tasks
	const [tasks, setTasks] = useState<Task[]>([]);
	const getTasks = async () => {
		try {
			const { data: tasks, error } = await supabase
				.from("tasks")
				.select()
				.order("created_at", { ascending: false });
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
	const updateForm = <Field extends keyof TaskForm>(key: Field, value: TaskForm[Field]) => {
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
			setIsCreateModalVisible(false);
			getTasks();
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	// update is done task
	const toggleTaskDone = async (taskId: string) => {
		try {
			const { error } = await supabase
				.from("tasks")
				.update({
					is_done: !tasks.find((t) => t.id === taskId)?.is_done,
				})
				.eq("id", taskId);
			if (error) throw error.message;
			getTasks();
		} catch (error) {
			throw error;
		}
	};

	// update task
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const handleUpdateTask = async () => {
		if (!selectedTask) return;
		if (!form.title.trim()) return;
		try {
			setIsLoading(true);
			const { error } = await supabase
				.from("tasks")
				.update({
					...form,
				})
				.eq("id", selectedTask?.id);
			if (error) throw error.message;
		} catch (error) {
			throw error;
		} finally {
			setIsUpdateModalVisible(false);
			setIsLoading(false);
			setForm({ title: "" });
			getTasks();
		}
	};

	// alert delete task
	const confirmDeleteTask = (task: Task) => {
		Alert.alert("Hapus Task", `Yakin mau hapus task ${task.title}?`, [
			{
				text: "Batal",
				style: "cancel",
			},
			{
				text: "Hapus",
				style: "destructive",
				onPress: () => handleDeleteTask(task.id),
			},
		]);
	};
	const handleDeleteTask = async (taskId: string) => {
		try {
			setIsLoading(true);
			const { error } = await supabase.from("tasks").delete().eq("id", taskId);
			if (error) throw error.message;
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
			getTasks();
		}
	};

	// search task
	const [search, setSearch] = useState<string>("");
	const searchTasks = async (keyword: string) => {
		try {
			setIsLoading(true);
			let query = supabase.from("tasks").select().order("created_at", { ascending: false });
			if (keyword.trim()) query = query.ilike("title", `%${keyword}%`);
			const { data, error } = await query;
			if (error) throw error.message;
			setTasks(data || []);
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	};
	useEffect(() => {
		const delay = setTimeout(() => {
			searchTasks(search);
		}, 400);
		return () => clearTimeout(delay);
	}, [search]);

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

			{/* search task */}
			<View className="mb-6">
				<Text className="text-white font-semibold mb-2">Search Task</Text>
				<View className="flex-row items-center gap-3">
					<View className="flex-1">
						<TextInput
							className="bg-white rounded-2xl px-4 py-2"
							value={search}
							onChangeText={setSearch}
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>
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
							<View className="flex flex-row items-center gap-3">
								<Text
									className={`text-base ${item.is_done ? "line-through text-neutral-400" : ""}`}>
									{item.title}
								</Text>
								{item.is_done && <Text className="text-green-600 font-semibold">✓</Text>}
							</View>
							<View className="flex flex-row items-center gap-3">
								<Pressable
									className="p-2 rounded-xl bg-yellow-500"
									disabled={isLoading}
									onPress={() => {
										setIsUpdateModalVisible(true);
										setSelectedTask(item);
										setForm({
											title: item.title,
											is_done: item.is_done,
										});
									}}>
									<Feather name="edit" size={17} color="white" />
								</Pressable>
								<Pressable
									className="p-2 rounded-xl bg-red-500"
									onPress={() => confirmDeleteTask(item)}
									disabled={isLoading}>
									<Feather name="trash" size={17} color="white" />
								</Pressable>
								<Switch
									value={item.is_done}
									onValueChange={() => toggleTaskDone(item.id)}
									trackColor={{ false: "#ccc", true: "#4ade80" }}
									thumbColor={item.is_done ? "#16a34a" : "#f3f4f6"}
								/>
							</View>
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
				onPress={() => setIsCreateModalVisible(true)}
				className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center">
				<Feather name="plus" size={26} color="white" />
			</Pressable>

			{/* modal add */}
			<Modal
				visible={isCreateModalVisible}
				animationType="slide"
				transparent
				navigationBarTranslucent={false}
				statusBarTranslucent={false}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					className="flex-1">
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
									onPress={() => setIsCreateModalVisible(false)}
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
				</KeyboardAvoidingView>
			</Modal>

			{/* modal update */}
			<Modal
				visible={isUpdateModalVisible}
				animationType="slide"
				transparent
				navigationBarTranslucent={false}
				statusBarTranslucent={false}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					className="flex-1">
					<View className="flex-1 bg-neutral-900/40 justify-end">
						<View className="bg-white rounded-t-3xl p-6">
							<Text className="text-xl font-bold mb-4">Update Task</Text>
							<TextInput
								placeholder="Task title..."
								className="border border-neutral-300 rounded-xl px-4 py-3 mb-4"
								value={form.title}
								onChangeText={(value) => updateForm("title", value)}
							/>
							<View className="flex-row gap-3">
								<Pressable
									onPress={() => {
										setIsUpdateModalVisible(false);
										setForm({ title: "" });
									}}
									className="flex-1 py-3 rounded-xl bg-neutral-200 items-center">
									<Text>Cancel</Text>
								</Pressable>
								<Pressable
									className="flex-1 py-3 rounded-xl bg-black items-center"
									onPress={handleUpdateTask}
									disabled={isLoading}>
									<Text className="text-white font-semibold">Save</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}
