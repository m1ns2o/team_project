<template>
  <div class="container">
    <h1>가능 시간 선택</h1>
    <form @submit.prevent="submit">
      <div class="input-row">
        <input v-model="name" placeholder="이름 입력" required />
        <button type="submit">제출</button>
      </div>
    </form>
    <div class="timetable">
      <table>
        <thead>
          <tr>
            <th>시간/요일</th>
            <th v-for="(day, d) in days" :key="d">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hour in [10,11,12,13,14,15,16,17]" :key="hour">
            <td>{{ hourLabel(hour - 1) }}</td>
            <td v-for="d in 2" :key="d"
                :class="cellClass(d - 1, hour - 1)"
                @mousedown="startSelect(d - 1, hour - 1)"
                @mouseenter="dragSelect(d - 1, hour - 1)"
                @mouseup="stopSelect"
            >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="legend">
      <span class="selected">내가 선택한 칸</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

// const days = ['월', '화', '수', '목', '금', '토', '일'];
const days = ['목', '금'];

type Slot = { day: number, hour: number };

export default defineComponent({
  setup() {
    const name = ref('');
    const selected = ref<Slot[]>([]);
    const selecting = ref(false);

    const hourLabel = (h: number) => `${h}:00~${h+1}:00`;
    const cellKey = (day: number, hour: number) => `${day}-${hour}`;

    const cellClass = (day: number, hour: number) => {
      const mine = selected.value.some(s => s.day === day && s.hour === hour);
      return {
        selected: mine
      };
    };

    const startSelect = (day: number, hour: number) => {
      selecting.value = true;
      toggleSlot(day, hour);
    };
    const dragSelect = (day: number, hour: number) => {
      if (selecting.value) toggleSlot(day, hour);
    };
    const stopSelect = () => { selecting.value = false; };

    function toggleSlot(day: number, hour: number) {
      const idx = selected.value.findIndex(s => s.day === day && s.hour === hour);
      if (idx >= 0) {
        selected.value.splice(idx, 1);
      } else {
        selected.value.push({ day, hour });
      }
    }

    async function submit() {
      await axios.post('/api/submit', {
        name: name.value,
        slots: selected.value
      });
      alert('제출 완료! 결과 페이지에서 확인하세요.');
      selected.value = [];
    }

    return {
      name,
      days,
      selected,
      hourLabel,
      cellClass,
      startSelect,
      dragSelect,
      stopSelect,
      submit
    };
  }
});
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 20px auto;
  font-family: 'Noto Sans KR', sans-serif;
}
h1 {
  text-align: center;
}
.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: center;
}
.timetable {
  overflow-x: auto;
  margin-bottom: 15px;
}
table {
  border-collapse: collapse;
  width: 100%;
}
/* Base styles */
:root {
  --primary-color: #a2d5f2;
  --primary-dark: #7eb8d9;
  --primary-light: #c4e3f8;
  --text-on-primary: #1e5985;
  --border-radius: 6px;
  --transition: all 0.3s ease;
}

/* Button styles */
.btn {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--border-radius);
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn:focus {
  outline: 2px solid var(--primary-dark);
  outline-offset: 2px;
}

/* Input styles */
.input {
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius);
  padding: 10px 12px;
  font-size: 16px;
  transition: var(--transition);
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--primary-dark);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.input::placeholder {
  color: #a0b7c5;
}

/* Input with icon */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-group .icon {
  position: absolute;
  left: 10px;
  color: var(--primary-color);
}

.input-group .input {
  padding-left: 36px;
}
th, td {
  border: 1px solid #bbb;
  text-align: center;
  min-width: 80px;
  min-height: 28px;
  position: relative;
  user-select: none;
}
th {
  background: #f5f5f5;
}
td.selected {
  background: #a2d5f2;
}
.legend {
  margin-top: 10px;
  font-size: 0.9em;
  display: flex;
  gap: 20px;
  justify-content: center;
}
.selected {
  background: #a2d5f2;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
