import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { initDatabase, dbRun, dbAll, dbGet } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库
await initDatabase();

// API路由

// 创建新测试会话（自动生成participant_id）
app.post('/api/sessions', async (req, res) => {
  try {
    const { testConfig } = req.body;
    const sessionId = uuidv4();
    const participantId = uuidv4(); // 自动生成用户ID
    
    await dbRun(
      `INSERT INTO test_sessions (id, participant_id, test_config, created_at) 
       VALUES (?, ?, ?, ?)`,
      [sessionId, participantId, JSON.stringify(testConfig), Date.now()]
    );

    res.json({
      sessionId,
      participantId,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// 保存Phase1测试结果
app.post('/api/sessions/:sessionId/phase1', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { results } = req.body;

    // 验证会话是否存在
    const session = await dbGet('SELECT id FROM test_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 批量插入Phase1结果
    for (const result of results) {
      const resultId = uuidv4();
      await dbRun(
        `INSERT INTO phase1_results 
         (id, session_id, image_id, group_name, keyword, is_match, reaction_time_ms, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resultId,
          sessionId,
          result.imageId,
          result.group,
          result.keyword,
          result.isMatch ? 1 : 0,
          result.reactionTimeMs,
          result.timestamp
        ]
      );
    }

    res.json({ message: 'Phase1 results saved successfully', count: results.length });
  } catch (error) {
    console.error('Error saving phase1 results:', error);
    res.status(500).json({ error: 'Failed to save phase1 results' });
  }
});

// 保存Phase2测试结果
app.post('/api/sessions/:sessionId/phase2', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { results } = req.body;

    // 验证会话是否存在
    const session = await dbGet('SELECT id FROM test_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 批量插入Phase2结果
    for (const result of results) {
      const resultId = uuidv4();
      await dbRun(
        `INSERT INTO phase2_results 
         (id, session_id, group_name, selected_keywords, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          resultId,
          sessionId,
          result.group,
          JSON.stringify(result.selectedKeywords),
          Date.now()
        ]
      );
    }

    res.json({ message: 'Phase2 results saved successfully', count: results.length });
  } catch (error) {
    console.error('Error saving phase2 results:', error);
    res.status(500).json({ error: 'Failed to save phase2 results' });
  }
});

// 获取单个会话的所有数据
app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await dbGet(
      'SELECT * FROM test_sessions WHERE id = ?',
      [sessionId]
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const phase1Results = await dbAll(
      `SELECT image_id as imageId, group_name as group, keyword, 
              is_match as isMatch, reaction_time_ms as reactionTimeMs, timestamp
       FROM phase1_results WHERE session_id = ?`,
      [sessionId]
    );

    const phase2Results = await dbAll(
      `SELECT group_name as group, selected_keywords as selectedKeywords
       FROM phase2_results WHERE session_id = ?`,
      [sessionId]
    );

    // 转换数据类型
    const formattedPhase1 = phase1Results.map(r => ({
      ...r,
      isMatch: r.isMatch === 1,
      reactionTimeMs: r.reactionTimeMs
    }));

    const formattedPhase2 = phase2Results.map(r => ({
      ...r,
      selectedKeywords: JSON.parse(r.selectedKeywords)
    }));

    res.json({
      session: {
        ...session,
        testConfig: JSON.parse(session.test_config)
      },
      phase1Results: formattedPhase1,
      phase2Results: formattedPhase2
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// 获取所有会话数据（用于分析面板）
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await dbAll('SELECT * FROM test_sessions ORDER BY created_at DESC');

    // 获取所有会话的Phase1和Phase2结果
    const allPhase1Results = await dbAll(
      `SELECT p1.session_id, p1.image_id as imageId, p1.group_name as group, 
              p1.keyword, p1.is_match as isMatch, p1.reaction_time_ms as reactionTimeMs, 
              p1.timestamp
       FROM phase1_results p1`
    );

    const allPhase2Results = await dbAll(
      `SELECT p2.session_id, p2.group_name as group, p2.selected_keywords as selectedKeywords
       FROM phase2_results p2`
    );

    // 转换数据类型
    const formattedPhase1 = allPhase1Results.map(r => ({
      ...r,
      isMatch: r.isMatch === 1,
      reactionTimeMs: r.reactionTimeMs
    }));

    const formattedPhase2 = allPhase2Results.map(r => ({
      ...r,
      selectedKeywords: JSON.parse(r.selectedKeywords)
    }));

    res.json({
      sessions: sessions.map(s => ({
        ...s,
        testConfig: JSON.parse(s.test_config)
      })),
      phase1Results: formattedPhase1,
      phase2Results: formattedPhase2,
      totalParticipants: sessions.length
    });
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

