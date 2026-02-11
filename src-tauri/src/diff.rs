use serde::Serialize;
use similar::{Algorithm, ChangeTag, DiffOp, TextDiff};

#[derive(Serialize)]
pub struct DiffSegment {
    text: String,
    kind: String,
}

#[derive(Serialize)]
pub struct DiffLine {
    segments: Vec<DiffSegment>,
    changed: bool,
}

#[derive(Serialize)]
pub struct DiffResult {
    left: Vec<DiffLine>,
    right: Vec<DiffLine>,
}

#[tauri::command]
pub fn diff_texts(left: String, right: String) -> DiffResult {
    let diff = TextDiff::configure()
        .algorithm(Algorithm::Myers)
        .diff_lines(&left, &right);

    let mut marked_left: Vec<DiffLine> = Vec::new();
    let mut marked_right: Vec<DiffLine> = Vec::new();

    for op in diff.ops() {
        match op {
            DiffOp::Equal { .. } => {
                for change in diff.iter_changes(op) {
                    let line = change.value().trim_end_matches('\n').to_string();

                    marked_left.push(DiffLine {
                        segments: vec![DiffSegment {
                            text: line.clone(),
                            kind: "equal".to_string(),
                        }],
                        changed: false,
                    });
                    marked_right.push(DiffLine {
                        segments: vec![DiffSegment {
                            text: line,
                            kind: "equal".to_string(),
                        }],
                        changed: false,
                    });
                }
            }
            _ => {
                let mut left_block: Vec<&str> = Vec::new();
                let mut right_block: Vec<&str> = Vec::new();

                for change in diff.iter_changes(op) {
                    match change.tag() {
                        ChangeTag::Delete => {
                            left_block.push(change.value().trim_end_matches('\n'));
                        }
                        ChangeTag::Insert => {
                            right_block.push(change.value().trim_end_matches('\n'));
                        }
                        ChangeTag::Equal => {
                            let line = change.value().trim_end_matches('\n');
                            left_block.push(line);
                            right_block.push(line);
                        }
                    }
                }

                let max_len = left_block.len().max(right_block.len());
                for i in 0..max_len {
                    let l = left_block.get(i).copied().unwrap_or("");
                    let r = right_block.get(i).copied().unwrap_or("");
                    let (left_segments, right_segments) = highlight_line_diff(l, r);
                    marked_left.push(DiffLine {
                        segments: left_segments,
                        changed: true,
                    });
                    marked_right.push(DiffLine {
                        segments: right_segments,
                        changed: true,
                    });
                }
            }
        }
    }

    debug_assert_eq!(marked_left.len(), marked_right.len());

    DiffResult {
        left: marked_left,
        right: marked_right,
    }
}


/// 对两个字符串进行字符级对比，返回左右侧 token 片段
fn highlight_line_diff(left: &str, right: &str) -> (Vec<DiffSegment>, Vec<DiffSegment>) {
    let diff = TextDiff::configure()
        .algorithm(Algorithm::Myers)
        .diff_chars(left, right);

    let mut left_segments = Vec::new();
    let mut right_segments = Vec::new();

    for change in diff.iter_all_changes() {
        match change.tag() {
            ChangeTag::Equal => {
                push_segment(&mut left_segments, "equal", change.value());
                push_segment(&mut right_segments, "equal", change.value());
            }
            ChangeTag::Delete => {
                push_segment(&mut left_segments, "delete", change.value());
            }
            ChangeTag::Insert => {
                push_segment(&mut right_segments, "insert", change.value());
            }
        }
    }

    (left_segments, right_segments)
}

fn push_segment(segments: &mut Vec<DiffSegment>, kind: &str, text: &str) {
    if text.is_empty() {
        return;
    }

    if let Some(last) = segments.last_mut() {
        if last.kind == kind {
            last.text.push_str(text);
            return;
        }
    }

    segments.push(DiffSegment {
        text: text.to_string(),
        kind: kind.to_string(),
    });
}
