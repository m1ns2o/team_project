<template>
  <div class="container">
    <h1>시간별 가능 인원 결과</h1>
    
    <!-- 전체 취소 버튼 추가 -->
    <div class="actions">
      <button class="btn btn-reset" @click="resetAll">전체 취소</button>
    </div>
    
    <div class="timetable">
      <table>
        <thead>
          <tr>
            <th>시간/요일</th>
            <th v-for="(day, d) in days" :key="d">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hour in 24" :key="hour">
            <td>{{ hourLabel(hour - 1) }}</td>
            <td v-for="d in 7" :key="d">
              <div class="names">
                <span v-for="n in namesInCell(d - 1, hour - 1)" :key="n" class="cell-name">{{ n }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';

const days = ['월', '화', '수', '목', '금', '토', '일'];

type SlotMap = Record<string, string[]>; // key: "d-h", value: [name]

export default defineComponent({
  setup() {
    const allAvailability = ref<SlotMap>({});

    const hourLabel = (h: number) => `${h}:00~${h+1}:00`;
    const cellKey = (day: number, hour: number) => `${day}-${hour}`;

    async function fetchAll() {
      try {
        const res = await axios.get('/api/all-availability');
        const map: SlotMap = {};
        for (const slot of res.data.slots) {
          const key = cellKey(slot.day_of_week, slot.hour);
          if (!map[key]) map[key] = [];
          map[key].push(slot.name);
        }
        allAvailability.value = map;
      } catch (error) {
        console.error('Failed to fetch availability data:', error);
        alert('데이터를 불러오는데 실패했습니다.');
      }
    }

    function namesInCell(day: number, hour: number): string[] {
      const key = cellKey(day, hour);
      return allAvailability.value[key] || [];
    }

    async function resetAll() {
      if (!confirm('정말 전체 데이터를 초기화할까요?')) return;
      
      try {
        await axios.post('/api/reset-all');
        await fetchAll();
        alert('모든 데이터가 초기화되었습니다.');
      } catch (error) {
        console.error('Failed to reset data:', error);
        alert('데이터 초기화에 실패했습니다.');
      }
    }

    onMounted(fetchAll);

    return {
      days,
      hourLabel,
      namesInCell,
      resetAll
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
/* 액션 버튼 컨테이너 스타일 */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}
/* 전체 취소 버튼 스타일 */
.btn {
  background-color: #a2d5f2;
  color: #1e5985;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn:hover {
  background-color: #7eb8d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.btn-reset {
  background-color: #a2d5f2;
}
.timetable {
  overflow-x: auto;
  margin-bottom: 15px;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th, td {
  border: 1px solid #bbb;
  text-align: center;
  min-width: 80px;
  min-height: 28px;
  position: relative;
}
th {
  background: #f5f5f5;
}
.names {
  font-size: 0.8em;
  color: #555;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.timetable-wrapper {
  overflow-x: auto;
}
.timetable-table {
  min-width: 100%;
  font-size: 0.92em;
}
.cell-name {
  background: #fff;
  border-radius: 3px;
  padding: 0 3px;
  margin: 1px 0;
  font-size: 0.96em;
  display: inline-block;
  word-break: break-all;
}
th, td {
  border: 1px solid #bbb;
  text-align: center;
  min-width: 40px;
  min-height: 28px;
  user-select: none;
  transition: background 0.2s;
}
th {
  background: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}
@media (max-width: 900px) {
  .timetable-table {
    font-size: 0.8em;
  }
}
@media (max-width: 600px) {
  .timetable-table {
    font-size: 0.7em;
  }
  th, td {
    min-width: 32px;
    padding: 2px;
  }
}
</style>